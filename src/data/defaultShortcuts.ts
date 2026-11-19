import { AppCategory, AppShortcut, IconKey, LauncherSettings } from '../types/launcher';

export const CATEGORY_LABELS: Record<AppCategory | 'all' | 'recent', string> = {
  all: 'همه برنامه‌ها',
  recent: 'اخیر و پرکاربرد',
  development: 'توسعه و کدنویسی',
  productivity: 'بهره‌وری و یادداشت',
  design: 'طراحی و رسانه',
  system: 'ابزارهای ویندوز',
  media: 'پخش و سرگرمی',
  web: 'وب و سرویس‌ها',
};

export const ICON_OPTIONS: { key: IconKey; label: string }[] = [
  { key: 'code', label: 'کدنویسی' },
  { key: 'terminal', label: 'ترمینال' },
  { key: 'folder', label: 'فایل‌ها' },
  { key: 'settings', label: 'تنظیمات' },
  { key: 'browser', label: 'مرورگر' },
  { key: 'calculator', label: 'ماشین‌حساب' },
  { key: 'figma', label: 'طراحی' },
  { key: 'notes', label: 'یادداشت' },
  { key: 'music', label: 'موسیقی' },
  { key: 'mail', label: 'ایمیل' },
  { key: 'git', label: 'گیت' },
  { key: 'store', label: 'فروشگاه' },
  { key: 'globe', label: 'وب' },
  { key: 'cpu', label: 'سیستم' },
  { key: 'layers', label: 'فضای کار' },
  { key: 'command', label: 'فرمان' },
];

export const DEFAULT_SETTINGS: LauncherSettings = {
  reduceMotion: false,
  use24HourClock: true,
  usePersianDigits: true,
  showGregorianDate: true,
  haloIntensity: 'balanced',
  ringSize: 'medium',
  glowTheme: 'azure',
  alwaysOnTop: true,
  minimizeToTray: true,
  positionPreset: 'center',
  orbOffset: { x: 0, y: 0 },
  autoFadeEnabled: true,
  idleOpacity: 0.34,
  idleDelaySeconds: 5,
  bridgeUrl: 'http://127.0.0.1:5959',
  userName: 'کاربر ویندوز ۱۱',
  userRole: 'میز کار اختصاصی',
};

export const DEFAULT_SHORTCUTS: AppShortcut[] = [
  {
    id: 'vscode',
    name: 'ویژوال استودیو کد',
    englishName: 'VS Code',
    description: 'محیط توسعه و ویرایش کد با اجرای مستقیم پروتکل دسکتاپ',
    category: 'development',
    launchType: 'uri',
    target: 'vscode://',
    fallbackWebUrl: 'https://vscode.dev',
    bridgeCommand: 'code',
    iconKey: 'code',
    size: 'featured',
    pinnedToDock: true,
    order: 0,
    launchCount: 0,
  },
  {
    id: 'windows-terminal',
    name: 'ترمینال ویندوز',
    englishName: 'Windows Terminal',
    description: 'خط فرمان مدرن PowerShell و WSL با اجرای محلی ویندوز',
    category: 'development',
    launchType: 'uri',
    target: 'wt:',
    bridgeCommand: 'wt.exe',
    iconKey: 'terminal',
    size: 'featured',
    pinnedToDock: true,
    order: 1,
    launchCount: 0,
  },
  {
    id: 'file-explorer',
    name: 'مدیریت فایل ویندوز',
    englishName: 'File Explorer',
    description: 'دسترسی به درایوها و پوشه‌ها از طریق پل محلی ویندوز',
    category: 'system',
    launchType: 'bridge',
    target: 'explorer.exe',
    bridgeCommand: 'explorer.exe',
    iconKey: 'folder',
    size: 'standard',
    pinnedToDock: true,
    order: 2,
    launchCount: 0,
  },
  {
    id: 'win-settings',
    name: 'تنظیمات ویندوز ۱۱',
    englishName: 'Windows Settings',
    description: 'باز کردن مستقیم پنجره تنظیمات سیستم‌عامل با پروتکل ms-settings',
    category: 'system',
    launchType: 'uri',
    target: 'ms-settings:',
    bridgeCommand: 'start ms-settings:',
    iconKey: 'settings',
    size: 'standard',
    pinnedToDock: true,
    order: 3,
    launchCount: 0,
  },
  {
    id: 'win-calculator',
    name: 'ماشین‌حساب',
    englishName: 'Calculator',
    description: 'ابزار محاسبات استاندارد، علمی و مهندسی ویندوز',
    category: 'system',
    launchType: 'uri',
    target: 'calculator:',
    bridgeCommand: 'calc.exe',
    iconKey: 'calculator',
    size: 'standard',
    pinnedToDock: false,
    order: 4,
    launchCount: 0,
  },
  {
    id: 'figma',
    name: 'فیگما',
    englishName: 'Figma',
    description: 'طراحی رابط کاربری و نمونه‌سازی تعاملی با پشتیبانی از نسخه وب',
    category: 'design',
    launchType: 'uri',
    target: 'figma://',
    fallbackWebUrl: 'https://www.figma.com',
    iconKey: 'figma',
    size: 'standard',
    pinnedToDock: true,
    order: 5,
    launchCount: 0,
  },
  {
    id: 'notion',
    name: 'نوشن',
    englishName: 'Notion',
    description: 'مدیریت اسناد، پروژه‌ها و پایگاه دانش روزانه',
    category: 'productivity',
    launchType: 'uri',
    target: 'notion://',
    fallbackWebUrl: 'https://www.notion.so',
    iconKey: 'notes',
    size: 'standard',
    pinnedToDock: false,
    order: 6,
    launchCount: 0,
  },
  {
    id: 'github',
    name: 'گیت‌هاب',
    englishName: 'GitHub',
    description: 'مخازن کد، بررسی تغییرات و مدیریت پروژه‌های نرم‌افزاری',
    category: 'development',
    launchType: 'web',
    target: 'https://github.com',
    iconKey: 'git',
    size: 'standard',
    pinnedToDock: false,
    order: 7,
    launchCount: 0,
  },
  {
    id: 'spotify',
    name: 'اسپاتیفای',
    englishName: 'Spotify',
    description: 'پخش موسیقی تمرکز و پادکست هنگام کار روزانه',
    category: 'media',
    launchType: 'uri',
    target: 'spotify:',
    fallbackWebUrl: 'https://open.spotify.com',
    iconKey: 'music',
    size: 'standard',
    pinnedToDock: true,
    order: 8,
    launchCount: 0,
  },
  {
    id: 'outlook-mail',
    name: 'ایمیل و تقویم',
    englishName: 'Outlook & Calendar',
    description: 'صندوق پیام و برنامه‌ریزی جلسات کاری',
    category: 'productivity',
    launchType: 'web',
    target: 'https://outlook.live.com',
    iconKey: 'mail',
    size: 'standard',
    pinnedToDock: false,
    order: 9,
    launchCount: 0,
  },
  {
    id: 'ms-store',
    name: 'فروشگاه مایکروسافت',
    englishName: 'Microsoft Store',
    description: 'نصب و به‌روزرسانی نرم‌افزارهای رسمی ویندوز ۱۱',
    category: 'system',
    launchType: 'uri',
    target: 'ms-windows-store:',
    iconKey: 'store',
    size: 'standard',
    pinnedToDock: false,
    order: 10,
    launchCount: 0,
  },
  {
    id: 'web-portal',
    name: 'جستجوی وب',
    englishName: 'Web Search',
    description: 'دسترسی سریع به مرورگر و منابع آنلاین',
    category: 'web',
    launchType: 'web',
    target: 'https://www.google.com',
    iconKey: 'browser',
    size: 'standard',
    pinnedToDock: false,
    order: 11,
    launchCount: 0,
  },
];

export const WINDOWS_BRIDGE_SCRIPT = `// launcher59-bridge.mjs
// اجرای محلی روی ویندوز ۱۱ برای اتصال واقعی LAUNCHER 59 به سیستم و اجرای فایل‌های exe
// پیش‌نیاز: Node.js 18+ روی ویندوز
// دستور اجرا: node launcher59-bridge.mjs

import http from 'node:http';
import os from 'node:os';
import { exec, spawn } from 'node:child_process';

const PORT = 5959;
const ALLOWED_COMMANDS = new Set([
  'code',
  'wt.exe',
  'explorer.exe',
  'calc.exe',
  'notepad.exe',
  'cmd.exe',
  'powershell.exe',
  'start ms-settings:',
]);

function getCpuSample() {
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

let prevCpu = getCpuSample();

function getCpuUsagePercent() {
  const curr = getCpuSample();
  const idleDiff = curr.idle - prevCpu.idle;
  const totalDiff = curr.total - prevCpu.total;
  prevCpu = curr;
  if (totalDiff <= 0) return 0;
  return Math.round(((totalDiff - idleDiff) / totalDiff) * 100);
}

function getWindowsDiskC() {
  return new Promise((resolve) => {
    exec(
      'powershell -NoProfile -Command "Get-PSDrive C | Select-Object Used,Free | ConvertTo-Json"',
      (err, stdout) => {
        if (err || !stdout) {
          resolve({ freeGb: 0, totalGb: 0 });
          return;
        }
        try {
          const parsed = JSON.parse(stdout);
          const freeGb = Math.round((parsed.Free / 1024 ** 3) * 10) / 10;
          const usedGb = Math.round((parsed.Used / 1024 ** 3) * 10) / 10;
          resolve({ freeGb, totalGb: Math.round((freeGb + usedGb) * 10) / 10 });
        } catch {
          resolve({ freeGb: 0, totalGb: 0 });
        }
      }
    );
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/stats' && req.method === 'GET') {
    const totalMem = Math.round((os.totalmem() / 1024 ** 3) * 10) / 10;
    const freeMem = Math.round((os.freemem() / 1024 ** 3) * 10) / 10;
    const disk = await getWindowsDiskC();
    const payload = {
      hostname: os.hostname(),
      osVersion: os.release(),
      cpuModel: os.cpus()[0]?.model || 'Windows CPU',
      cpuUsagePercent: getCpuUsagePercent(),
      totalMemoryGb: totalMem,
      usedMemoryGb: Math.round((totalMem - freeMem) * 10) / 10,
      diskDrive: 'C:',
      diskFreeGb: disk.freeGb,
      diskTotalGb: disk.totalGb,
      uptimeHours: Math.round((os.uptime() / 3600) * 10) / 10,
    };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(payload));
    return;
  }

  if (req.url === '/launch' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const { command } = JSON.parse(body || '{}');
        if (!command || typeof command !== 'string') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: 'Missing command' }));
          return;
        }
        // امنیت: تنها دستورات مجاز یا مسیرهای بدون کاراکترهای تزریق اجرا می‌شوند
        const clean = command.trim();
        const isWhitelisted = ALLOWED_COMMANDS.has(clean);
        const isSafeExePath = /^[a-zA-Z]:\\\\[^&|;><\`$]+\\.exe$/i.test(clean);
        if (!isWhitelisted && !isSafeExePath) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: 'Command not in allowlist' }));
          return;
        }
        if (clean.startsWith('start ')) {
          exec(clean, { windowsHide: true });
        } else {
          const child = spawn(clean, [], { detached: true, stdio: 'ignore', shell: false });
          child.unref();
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, launched: clean }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: String(e) }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('LAUNCHER 59 Windows Bridge listening at http://127.0.0.1:' + PORT);
});
`;
