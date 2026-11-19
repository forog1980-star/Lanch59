const {
  app,
  BrowserWindow,
  Menu,
  Notification,
  Tray,
  dialog,
  ipcMain,
  nativeImage,
  screen,
  shell,
} = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { pathToFileURL } = require('node:url');
const { execFile, spawn } = require('node:child_process');
const {
  extractAppIcons,
  pickIconImageFile,
  saveAppIconToDisk,
  deleteAppIconFromDisk,
} = require('./iconExtractor.cjs');

const appLaunchStart = Date.now();
let mainWindow = null;
let tray = null;
let startupMs = 0;
let isQuitting = false;
let currentMode = 'closed';
let currentRingSize = 'medium';
let currentCustomStageSize = null;
let currentOrbSize = 42;
let currentAlwaysOnTop = true;
let saveWindowTimer = null;

let windowState = {
  centerX: null,
  centerY: null,
  displayId: null,
  relX: 0.5,
  relY: 0.5,
  minimizeToTray: true,
};

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (!mainWindow.isVisible()) mainWindow.show();
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function getWindowStatePath() {
  return path.join(app.getPath('userData'), 'window-state.json');
}

function readPersistedAlwaysOnTop() {
  try {
    const settingsPath = getUserFilePath('settings');
    if (settingsPath && fs.existsSync(settingsPath)) {
      const parsed = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
      if (typeof parsed.alwaysOnTop === 'boolean') {
        return parsed.alwaysOnTop;
      }
    }
  } catch {
    // fallback to default true
  }
  return true;
}

function writePersistedAlwaysOnTop(enabled) {
  try {
    const settingsPath = getUserFilePath('settings');
    if (!settingsPath) return;
    let existing = {};
    if (fs.existsSync(settingsPath)) {
      try {
        existing = JSON.parse(fs.readFileSync(settingsPath, 'utf-8')) || {};
      } catch {
        existing = {};
      }
    }
    existing.alwaysOnTop = Boolean(enabled);
    fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
    fs.writeFileSync(settingsPath, JSON.stringify(existing, null, 2), 'utf-8');
  } catch {
    // ignore disk error
  }
}

function applyAlwaysOnTop(enabled, options = {}) {
  const { persist = true, notifyRenderer = false } = options;
  currentAlwaysOnTop = Boolean(enabled);
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setAlwaysOnTop(currentAlwaysOnTop, 'floating');
    if (notifyRenderer) {
      mainWindow.webContents.send(
        'tray:command',
        currentAlwaysOnTop ? 'always-on-top:true' : 'always-on-top:false'
      );
    }
  }
  if (persist) {
    writePersistedAlwaysOnTop(currentAlwaysOnTop);
  }
  rebuildTrayMenu();
  return currentAlwaysOnTop;
}

function loadWindowState() {
  try {
    const file = getWindowStatePath();
    if (fs.existsSync(file)) {
      const parsed = JSON.parse(fs.readFileSync(file, 'utf-8'));
      windowState = {
        centerX: typeof parsed.centerX === 'number' ? parsed.centerX : null,
        centerY: typeof parsed.centerY === 'number' ? parsed.centerY : null,
        displayId: typeof parsed.displayId === 'number' ? parsed.displayId : null,
        relX: typeof parsed.relX === 'number' ? Math.max(0, Math.min(1, parsed.relX)) : 0.5,
        relY: typeof parsed.relY === 'number' ? Math.max(0, Math.min(1, parsed.relY)) : 0.5,
        minimizeToTray:
          parsed.minimizeToTray !== undefined ? Boolean(parsed.minimizeToTray) : true,
      };
    }
  } catch {
    // keep default state
  }
}

function saveWindowStateImmediate() {
  try {
    const file = getWindowStatePath();
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(windowState, null, 2), 'utf-8');
  } catch {
    // ignore disk error
  }
}

function scheduleSaveWindowState() {
  if (saveWindowTimer) clearTimeout(saveWindowTimer);
  saveWindowTimer = setTimeout(saveWindowStateImmediate, 280);
}

function getClosedEdgeMargin(workArea) {
  return Math.min(84, Math.floor(Math.min(workArea.width, workArea.height) / 3));
}

function resolveDisplayForState() {
  const displays = screen.getAllDisplays();
  if (typeof windowState.displayId === 'number') {
    const matched = displays.find((d) => d.id === windowState.displayId);
    if (matched) return matched;
  }
  if (typeof windowState.centerX === 'number' && typeof windowState.centerY === 'number') {
    return screen.getDisplayNearestPoint({
      x: Math.round(windowState.centerX),
      y: Math.round(windowState.centerY),
    });
  }
  return screen.getPrimaryDisplay();
}

function clampClosedCenterToDisplay(centerX, centerY, display) {
  const wa = display.workArea;
  const margin = getClosedEdgeMargin(wa);
  const minX = wa.x + margin;
  const maxX = Math.max(minX, wa.x + wa.width - margin);
  const minY = wa.y + margin;
  const maxY = Math.max(minY, wa.y + wa.height - margin);

  const clampedX = Math.round(Math.max(minX, Math.min(maxX, centerX)));
  const clampedY = Math.round(Math.max(minY, Math.min(maxY, centerY)));

  const spanX = Math.max(1, maxX - minX);
  const spanY = Math.max(1, maxY - minY);

  windowState.centerX = clampedX;
  windowState.centerY = clampedY;
  windowState.displayId = display.id;
  windowState.relX = maxX > minX ? (clampedX - minX) / spanX : 0.5;
  windowState.relY = maxY > minY ? (clampedY - minY) / spanY : 0.5;

  return { centerX: clampedX, centerY: clampedY };
}

function getTargetDimensions(mode, ringSize, customStageSize, orbSize) {
  if (mode === 'settings') {
    return { width: 650, height: 700 };
  }
  if (mode === 'radial') {
    if (typeof customStageSize === 'number' && Number.isFinite(customStageSize) && customStageSize >= 260) {
      const side = Math.ceil(customStageSize) + 48;
      return { width: side, height: side };
    }
    if (ringSize === 'small') return { width: 412, height: 412 };
    if (ringSize === 'large') return { width: 548, height: 548 };
    return { width: 476, height: 476 };
  }
  const safeOrb = typeof orbSize === 'number' && Number.isFinite(orbSize) ? Math.max(36, Math.min(128, orbSize)) : 42;
  // Generous transparent padding around closed orb so luminous glow & 3D shadow never clip into a square box edge
  const closedSide = Math.max(128, Math.ceil(safeOrb + 88));
  return { width: closedSide, height: closedSide };
}

function ensureCenterInitialized() {
  const display = resolveDisplayForState();
  const wa = display.workArea;
  if (typeof windowState.centerX !== 'number' || typeof windowState.centerY !== 'number') {
    clampClosedCenterToDisplay(
      Math.round(wa.x + wa.width / 2),
      Math.round(wa.y + wa.height / 2),
      display
    );
  } else {
    clampClosedCenterToDisplay(windowState.centerX, windowState.centerY, display);
  }
}

function clampTopLeftForCenter(centerX, centerY, width, height, displayOverride) {
  const display =
    displayOverride ||
    screen.getDisplayNearestPoint({
      x: Math.round(centerX),
      y: Math.round(centerY),
    });
  const wa = display.workArea;
  const clampedW = Math.min(width, wa.width);
  const clampedH = Math.min(height, wa.height);
  const rawX = Math.round(centerX - clampedW / 2);
  const rawY = Math.round(centerY - clampedH / 2);
  const x = Math.max(wa.x, Math.min(wa.x + wa.width - clampedW, rawX));
  const y = Math.max(wa.y, Math.min(wa.y + wa.height - clampedH, rawY));
  return { x, y, width: clampedW, height: clampedH };
}

function getPlacementContextPayload() {
  ensureCenterInitialized();
  const display = resolveDisplayForState();
  return {
    orbCenterX: windowState.centerX,
    orbCenterY: windowState.centerY,
    workArea: display.workArea,
    displayId: display.id,
  };
}

function applyWindowBounds(mode, ringSize, customStageSize, orbSize) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  currentMode = mode;
  if (ringSize) currentRingSize = ringSize;
  if (typeof orbSize === 'number' && Number.isFinite(orbSize)) {
    currentOrbSize = Math.max(36, Math.min(128, orbSize));
  }
  if (mode === 'radial') {
    if (typeof customStageSize === 'number' && Number.isFinite(customStageSize)) {
      currentCustomStageSize = customStageSize;
    }
  } else {
    currentCustomStageSize = null;
  }
  ensureCenterInitialized();
  const display = resolveDisplayForState();
  const dims = getTargetDimensions(currentMode, currentRingSize, currentCustomStageSize, currentOrbSize);
  // Keep saved windowState.centerX / centerY untouched when radial/settings temporarily shift inward
  const bounds = clampTopLeftForCenter(
    windowState.centerX,
    windowState.centerY,
    dims.width,
    dims.height,
    display
  );
  mainWindow.setBounds(bounds, false);
}

function reconcileDisplayChange() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  const display = resolveDisplayForState();
  const wa = display.workArea;
  const margin = getClosedEdgeMargin(wa);
  const minX = wa.x + margin;
  const maxX = Math.max(minX, wa.x + wa.width - margin);
  const minY = wa.y + margin;
  const maxY = Math.max(minY, wa.y + wa.height - margin);

  const mappedX = Math.round(minX + (maxX - minX) * (windowState.relX ?? 0.5));
  const mappedY = Math.round(minY + (maxY - minY) * (windowState.relY ?? 0.5));
  clampClosedCenterToDisplay(mappedX, mappedY, display);
  applyWindowBounds(currentMode, currentRingSize, currentCustomStageSize);
  saveWindowStateImmediate();
  mainWindow.webContents.send('tray:command', 'display-changed');
}

function sampleCpuTimes() {
  const cpus = os.cpus();
  let idle = 0;
  let total = 0;
  for (const cpu of cpus) {
    for (const type of Object.keys(cpu.times)) {
      total += cpu.times[type];
    }
    idle += cpu.times.idle;
  }
  return { idle, total };
}

let prevCpu = sampleCpuTimes();

function getCpuUsagePercent() {
  const curr = sampleCpuTimes();
  const idleDiff = curr.idle - prevCpu.idle;
  const totalDiff = curr.total - prevCpu.total;
  prevCpu = curr;
  if (totalDiff <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round(((totalDiff - idleDiff) / totalDiff) * 100)));
}

function getSystemDiskInfo() {
  return new Promise((resolve) => {
    if (process.platform === 'win32') {
      execFile(
        'powershell.exe',
        [
          '-NoProfile',
          '-NonInteractive',
          '-Command',
          'Get-PSDrive C | Select-Object Used,Free | ConvertTo-Json -Compress',
        ],
        { windowsHide: true, timeout: 2500 },
        (err, stdout) => {
          if (err || !stdout) {
            resolve({ drive: 'C:', freeGb: 0, totalGb: 0 });
            return;
          }
          try {
            const parsed = JSON.parse(stdout.trim());
            const freeGb = Math.round((Number(parsed.Free || 0) / 1024 ** 3) * 10) / 10;
            const usedGb = Math.round((Number(parsed.Used || 0) / 1024 ** 3) * 10) / 10;
            resolve({
              drive: 'C:',
              freeGb,
              totalGb: Math.round((freeGb + usedGb) * 10) / 10,
            });
          } catch {
            resolve({ drive: 'C:', freeGb: 0, totalGb: 0 });
          }
        }
      );
      return;
    }

    execFile('df', ['-B1', '/'], { timeout: 1500 }, (err, stdout) => {
      if (err || !stdout) {
        resolve({ drive: '/', freeGb: 0, totalGb: 0 });
        return;
      }
      const lines = stdout.trim().split('\n');
      const cols = (lines[1] || '').trim().split(/\s+/);
      const totalGb = Math.round((Number(cols[1] || 0) / 1024 ** 3) * 10) / 10;
      const freeGb = Math.round((Number(cols[3] || 0) / 1024 ** 3) * 10) / 10;
      resolve({ drive: '/', freeGb, totalGb });
    });
  });
}

const SAFE_PROTOCOLS = new Set([
  'https:',
  'http:',
  'vscode:',
  'ms-settings:',
  'calculator:',
  'wt:',
  'spotify:',
  'figma:',
  'notion:',
  'ms-windows-store:',
  'outlookmail:',
  'x-github-client:',
]);

const SAFE_BUILTINS = new Set([
  'explorer.exe',
  'calc.exe',
  'notepad.exe',
  'wt.exe',
  'code',
  'cmd.exe',
  'powershell.exe',
]);

function isSafeExecutablePath(target) {
  if (typeof target !== 'string') return false;
  const trimmed = target.trim();
  if (!trimmed || /[&|;><`$]/.test(trimmed)) return false;
  if (SAFE_BUILTINS.has(trimmed.toLowerCase())) return true;
  if (/^[a-zA-Z]:\\[^*?"<>|]+\.(exe|lnk|bat|cmd|msc)$/i.test(trimmed)) {
    return fs.existsSync(trimmed);
  }
  return false;
}

function getUserFilePath(key) {
  const map = {
    shortcuts: 'shortcuts.json',
    settings: 'settings.json',
    notes: 'notes.txt',
    icons: 'icons-library.json',
  };
  const filename = map[key];
  if (!filename) return null;
  return path.join(app.getPath('userData'), filename);
}

function rebuildTrayMenu() {
  if (!tray) return;
  const menu = Menu.buildFromTemplate([
    {
      label: 'Show / Focus LAUNCHER 59',
      click: () => {
        if (!mainWindow) return;
        if (!mainWindow.isVisible()) mainWindow.show();
        mainWindow.focus();
      },
    },
    {
      label: 'Toggle Radial Ring',
      click: () => {
        if (!mainWindow) return;
        if (!mainWindow.isVisible()) mainWindow.show();
        mainWindow.focus();
        mainWindow.webContents.send('tray:command', 'toggle-ring');
      },
    },
    {
      label: 'Settings & Apps',
      click: () => {
        if (!mainWindow) return;
        if (!mainWindow.isVisible()) mainWindow.show();
        mainWindow.focus();
        mainWindow.webContents.send('tray:command', 'open-settings');
      },
    },
    { type: 'separator' },
    {
      label: 'Always on Top',
      type: 'checkbox',
      checked: currentAlwaysOnTop,
      click: (item) => {
        applyAlwaysOnTop(item.checked, { persist: true, notifyRenderer: true });
      },
    },
    { type: 'separator' },
    {
      label: 'Quit LAUNCHER 59',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);
  tray.setContextMenu(menu);
}

function createTray() {
  const iconPath = path.join(__dirname, '..', 'build', 'icon.png');
  if (!fs.existsSync(iconPath)) return;
  const img = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  tray = new Tray(img);
  tray.setToolTip('LAUNCHER 59');
  tray.on('click', () => {
    if (!mainWindow) return;
    if (!mainWindow.isVisible()) {
      mainWindow.show();
      mainWindow.focus();
    } else {
      mainWindow.focus();
      mainWindow.webContents.send('tray:command', 'toggle-ring');
    }
  });
  rebuildTrayMenu();
}

function createMainWindow() {
  loadWindowState();
  currentAlwaysOnTop = readPersistedAlwaysOnTop();
  ensureCenterInitialized();
  const dims = getTargetDimensions('closed', 'medium', null, currentOrbSize);
  const initialBounds = clampTopLeftForCenter(
    windowState.centerX,
    windowState.centerY,
    dims.width,
    dims.height
  );

  const iconPath = path.join(__dirname, '..', 'build', 'icon.png');
  mainWindow = new BrowserWindow({
    x: initialBounds.x,
    y: initialBounds.y,
    width: initialBounds.width,
    height: initialBounds.height,
    frame: false,
    transparent: true,
    hasShadow: false,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    alwaysOnTop: currentAlwaysOnTop,
    title: 'LAUNCHER 59',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    backgroundColor: '#00000000',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (currentAlwaysOnTop) {
    mainWindow.setAlwaysOnTop(true, 'floating');
  } else {
    mainWindow.setAlwaysOnTop(false);
  }

  const rendererPath = path.join(__dirname, '..', 'renderer', 'index.html');
  const allowedRendererUrl = pathToFileURL(rendererPath).href;
  mainWindow.loadFile(rendererPath);

  mainWindow.once('ready-to-show', () => {
    startupMs = Date.now() - appLaunchStart;
    mainWindow.show();
  });

  mainWindow.on('blur', () => {
    if (currentMode === 'radial' && mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('tray:command', 'close-ring');
    }
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting && windowState.minimizeToTray) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    if (
      navigationUrl === allowedRendererUrl ||
      navigationUrl.startsWith(`${allowedRendererUrl}#`) ||
      navigationUrl.startsWith(`${allowedRendererUrl}?`)
    ) {
      return;
    }
    event.preventDefault();
    try {
      const parsed = new URL(navigationUrl);
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
        shell.openExternal(navigationUrl);
      }
    } catch {
      // ignore invalid URLs
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    try {
      const parsed = new URL(url);
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
        shell.openExternal(url);
      }
    } catch {
      // ignore
    }
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  app.setAppUserModelId('com.launcher59.desktop');

  ipcMain.handle('desktop:getInfo', () => ({
    isDesktop: true,
    platform: process.platform,
    arch: process.arch,
    appVersion: app.getVersion(),
    userDataPath: app.getPath('userData'),
    startupMs: startupMs || Date.now() - appLaunchStart,
    memoryRssMb: Math.round(process.memoryUsage().rss / (1024 * 1024)),
    alwaysOnTop: currentAlwaysOnTop,
    minimizeToTray: windowState.minimizeToTray,
  }));

  ipcMain.handle('desktop:getSystemStats', async () => {
    const totalMem = Math.round((os.totalmem() / 1024 ** 3) * 10) / 10;
    const freeMem = Math.round((os.freemem() / 1024 ** 3) * 10) / 10;
    const disk = await getSystemDiskInfo();
    return {
      hostname: os.hostname(),
      osVersion: os.release(),
      cpuModel: os.cpus()[0]?.model || 'Processor',
      cpuUsagePercent: getCpuUsagePercent(),
      totalMemoryGb: totalMem,
      usedMemoryGb: Math.round((totalMem - freeMem) * 10) / 10,
      diskDrive: disk.drive,
      diskFreeGb: disk.freeGb,
      diskTotalGb: disk.totalGb,
      uptimeHours: Math.round((os.uptime() / 3600) * 10) / 10,
      processRssMb: Math.round(process.memoryUsage().rss / (1024 * 1024)),
      startupMs: startupMs || Date.now() - appLaunchStart,
    };
  });

  ipcMain.handle('desktop:launchTarget', async (_event, payload) => {
    try {
      const { launchType, target, bridgeCommand, preferWeb, fallbackWebUrl } = payload || {};

      if (preferWeb && fallbackWebUrl) {
        const parsed = new URL(fallbackWebUrl);
        if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
          await shell.openExternal(fallbackWebUrl);
          return { ok: true, mode: 'desktop-uri', message: 'نسخه وب در مرورگر پیش‌فرض باز شد.' };
        }
      }

      if (launchType === 'web') {
        const parsed = new URL(target);
        if (!SAFE_PROTOCOLS.has(parsed.protocol)) {
          return { ok: false, mode: 'blocked', message: 'پروتکل نشانی مجاز نیست.' };
        }
        await shell.openExternal(target);
        return { ok: true, mode: 'desktop-uri', message: `نشانی ${target} باز شد.` };
      }

      if (launchType === 'uri') {
        const parsed = new URL(target);
        if (!SAFE_PROTOCOLS.has(parsed.protocol)) {
          return { ok: false, mode: 'blocked', message: `پروتکل ${parsed.protocol} مجاز نیست.` };
        }
        await shell.openExternal(target);
        return { ok: true, mode: 'desktop-uri', message: `برنامه با پروتکل ${target} اجرا شد.` };
      }

      const cmd = (bridgeCommand || target || '').trim();
      if (cmd.startsWith('start ')) {
        const uriPart = cmd.slice(6).trim();
        const parsed = new URL(uriPart);
        if (SAFE_PROTOCOLS.has(parsed.protocol)) {
          await shell.openExternal(uriPart);
          return { ok: true, mode: 'desktop-uri', message: `اجرا شد: ${uriPart}` };
        }
      }

      if (!isSafeExecutablePath(cmd)) {
        return {
          ok: false,
          mode: 'blocked',
          message: `مسیر فایل «${cmd}» معتبر یا یافت‌شدنی نیست. لطفاً مسیر صحیح برنامه را انتخاب کنید.`,
        };
      }

      if (/^[a-zA-Z]:\\/.test(cmd)) {
        const errMsg = await shell.openPath(cmd);
        if (errMsg) {
          return { ok: false, mode: 'blocked', message: `خطا در اجرا: ${errMsg}` };
        }
        return { ok: true, mode: 'desktop-exe', message: `برنامه اجرا شد: ${path.basename(cmd)}` };
      }

      const child = spawn(cmd, [], { detached: true, stdio: 'ignore', shell: false });
      child.unref();
      return { ok: true, mode: 'desktop-exe', message: `برنامه «${cmd}» اجرا شد.` };
    } catch (err) {
      return { ok: false, mode: 'blocked', message: `اجرا انجام نشد: ${String(err)}` };
    }
  });

  ipcMain.handle('desktop:pickExecutable', async () => {
    if (!mainWindow) return null;
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'انتخاب نرم‌افزار ویندوز',
      properties: ['openFile'],
      filters: [
        { name: 'Windows Applications & Shortcuts', extensions: ['exe', 'lnk', 'bat', 'cmd'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0];
  });

  ipcMain.handle('desktop:extractAppIcons', async (_event, filePath) => {
    return extractAppIcons(filePath);
  });

  ipcMain.handle('desktop:pickIconImage', async () => {
    return pickIconImageFile(mainWindow);
  });

  ipcMain.handle('desktop:saveAppIcon', (_event, appId, dataUrl, variant) => {
    return saveAppIconToDisk(appId, dataUrl, variant);
  });

  ipcMain.handle('desktop:deleteAppIcon', (_event, appId) => {
    return deleteAppIconFromDisk(appId);
  });

  ipcMain.handle('desktop:getAutoStart', () => {
    return app.getLoginItemSettings().openAtLogin;
  });

  ipcMain.handle('desktop:setAutoStart', (_event, enabled) => {
    app.setLoginItemSettings({
      openAtLogin: Boolean(enabled),
      path: process.execPath,
    });
    return app.getLoginItemSettings().openAtLogin;
  });

  ipcMain.handle('desktop:setAlwaysOnTop', (_event, enabled) => {
    return applyAlwaysOnTop(enabled, { persist: true, notifyRenderer: false });
  });

  ipcMain.handle('desktop:setMinimizeToTray', (_event, enabled) => {
    windowState.minimizeToTray = Boolean(enabled);
    saveWindowStateImmediate();
    return windowState.minimizeToTray;
  });

  ipcMain.handle('desktop:getPlacementContext', () => {
    return getPlacementContextPayload();
  });

  ipcMain.handle('desktop:setWindowMode', (_event, payload) => {
    const mode = payload?.mode || 'closed';
    const ringSize = payload?.ringSize || currentRingSize;
    const stageSize = typeof payload?.stageSize === 'number' ? payload.stageSize : null;
    const orbSize = typeof payload?.orbSize === 'number' ? payload.orbSize : currentOrbSize;
    applyWindowBounds(mode, ringSize, stageSize, orbSize);
    return getPlacementContextPayload();
  });

  ipcMain.handle('desktop:moveWindowBy', (_event, dx, dy) => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    ensureCenterInitialized();
    const numDx = Number(dx) || 0;
    const numDy = Number(dy) || 0;
    const dims = getTargetDimensions(currentMode, currentRingSize, currentCustomStageSize, currentOrbSize);
    const nextCenterX = windowState.centerX + numDx;
    const nextCenterY = windowState.centerY + numDy;
    const display = screen.getDisplayNearestPoint({
      x: Math.round(nextCenterX),
      y: Math.round(nextCenterY),
    });
    clampClosedCenterToDisplay(nextCenterX, nextCenterY, display);
    const bounds = clampTopLeftForCenter(
      windowState.centerX,
      windowState.centerY,
      dims.width,
      dims.height,
      display
    );
    mainWindow.setPosition(bounds.x, bounds.y, false);
    scheduleSaveWindowState();
  });

  ipcMain.handle('desktop:setPositionPreset', (_event, preset) => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    const display = resolveDisplayForState();
    const wa = display.workArea;
    const margin = getClosedEdgeMargin(wa);
    const midX = Math.round(wa.x + wa.width / 2);
    const midY = Math.round(wa.y + wa.height / 2);
    const leftX = Math.round(wa.x + margin);
    const rightX = Math.round(wa.x + wa.width - margin);
    const topY = Math.round(wa.y + margin);
    const bottomY = Math.round(wa.y + wa.height - margin);

    let targetX = midX;
    let targetY = midY;
    switch (preset) {
      case 'top':
        targetX = midX;
        targetY = topY;
        break;
      case 'bottom-center':
        targetX = midX;
        targetY = bottomY;
        break;
      case 'left':
        targetX = leftX;
        targetY = midY;
        break;
      case 'right':
        targetX = rightX;
        targetY = midY;
        break;
      case 'top-left':
        targetX = leftX;
        targetY = topY;
        break;
      case 'top-right':
        targetX = rightX;
        targetY = topY;
        break;
      case 'bottom-left':
        targetX = leftX;
        targetY = bottomY;
        break;
      case 'bottom-right':
        targetX = rightX;
        targetY = bottomY;
        break;
      case 'center':
      default:
        targetX = midX;
        targetY = midY;
        break;
    }
    clampClosedCenterToDisplay(targetX, targetY, display);
    applyWindowBounds(currentMode, currentRingSize, currentCustomStageSize);
    saveWindowStateImmediate();
    return getPlacementContextPayload();
  });

  ipcMain.handle('desktop:readUserFile', (_event, key) => {
    const filePath = getUserFilePath(key);
    if (!filePath || !fs.existsSync(filePath)) return null;
    return fs.readFileSync(filePath, 'utf-8');
  });

  ipcMain.handle('desktop:writeUserFile', (_event, key, content) => {
    const filePath = getUserFilePath(key);
    if (!filePath || typeof content !== 'string') return false;
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  });

  ipcMain.handle('desktop:notify', (_event, title, body) => {
    if (Notification.isSupported()) {
      new Notification({ title: String(title), body: String(body) }).show();
    }
  });

  ipcMain.handle('desktop:windowAction', (_event, action) => {
    if (!mainWindow) return;
    if (action === 'minimize') mainWindow.minimize();
    else if (action === 'maximize') {
      if (mainWindow.isMaximized()) mainWindow.unmaximize();
      else mainWindow.maximize();
    } else if (action === 'close') {
      mainWindow.close();
    } else if (action === 'quit') {
      isQuitting = true;
      app.quit();
    }
  });

  createMainWindow();
  createTray();

  screen.on('display-metrics-changed', reconcileDisplayChange);
  screen.on('display-added', reconcileDisplayChange);
  screen.on('display-removed', reconcileDisplayChange);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
