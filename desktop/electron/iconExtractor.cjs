const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const { execFile } = require('node:child_process');
const { app, dialog, nativeImage } = require('electron');

const MAX_EXTRACTED_ICONS = 16;

function hashString(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function sanitizeFileBase(rawPath) {
  const leaf = String(rawPath || '')
    .split(/[/\\]/)
    .pop()
    .replace(/\.(exe|lnk|bat|cmd|msc|dll|ico)$/i, '');
  if (!leaf) return 'Application';
  return leaf
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
}

function sanitizeAppId(appId) {
  return String(appId || 'app').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 96);
}

function getIconsDirectory() {
  const dir = path.join(app.getPath('userData'), 'icons');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/**
 * Runs an encoded PowerShell script on Windows to:
 * 1) Resolve .lnk shortcuts (TargetPath, IconLocation, Description)
 * 2) Read PE FileVersionInfo (FileDescription / ProductName)
 * 3) Extract all distinct icons (up to 16) via Shell32.ExtractIconEx + ExtractAssociatedIcon
 *    preserving full 32-bit ARGB transparency as base64 PNG data URLs.
 */
function runWindowsIconExtractionScript(inputPath) {
  return new Promise((resolve) => {
    if (process.platform !== 'win32') {
      resolve(null);
      return;
    }

    const psScript = `
param([string]$InputPath)
$ErrorActionPreference = 'SilentlyContinue'
Add-Type -AssemblyName System.Drawing

$resolvedPath = $InputPath
$iconSource = $InputPath
$iconIndex = 0
$lnkDescription = ''

if ($InputPath -match '\\.lnk$') {
  try {
    $wsh = New-Object -ComObject WScript.Shell
    $sc = $wsh.CreateShortcut($InputPath)
    if ($sc.TargetPath -and (Test-Path -LiteralPath $sc.TargetPath)) {
      $resolvedPath = $sc.TargetPath
      $iconSource = $sc.TargetPath
    }
    if ($sc.Description) {
      $lnkDescription = $sc.Description.Trim()
    }
    if ($sc.IconLocation) {
      $parts = $sc.IconLocation -split ','
      $rawLoc = [Environment]::ExpandEnvironmentVariables($parts[0].Trim())
      if ($rawLoc -and (Test-Path -LiteralPath $rawLoc)) {
        $iconSource = $rawLoc
        if ($parts.Length -gt 1) {
          [int]::TryParse($parts[1].Trim(), [ref]$iconIndex) | Out-Null
        }
      }
    }
  } catch {}
}

$detectedName = ''
if (Test-Path -LiteralPath $resolvedPath) {
  try {
    $vi = [System.Diagnostics.FileVersionInfo]::GetVersionInfo($resolvedPath)
    if ($vi.FileDescription -and $vi.FileDescription.Trim().Length -gt 1) {
      $detectedName = $vi.FileDescription.Trim()
    } elseif ($vi.ProductName -and $vi.ProductName.Trim().Length -gt 1) {
      $detectedName = $vi.ProductName.Trim()
    }
  } catch {}
}
if (-not $detectedName -and $lnkDescription) {
  $detectedName = $lnkDescription
}

Add-Type -TypeDefinition @"
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;

public static class Launcher59IconHelper {
  [DllImport("shell32.dll", CharSet = CharSet.Unicode)]
  private static extern uint ExtractIconEx(string lpszFile, int nIconIndex, IntPtr[] phiconLarge, IntPtr[] phiconSmall, uint nIcons);

  [DllImport("user32.dll", SetLastError = true)]
  private static extern bool DestroyIcon(IntPtr hIcon);

  private static string IconToPngBase64(Icon icon) {
    if (icon == null) return null;
    using (Bitmap bmp = icon.ToBitmap()) {
      using (MemoryStream ms = new MemoryStream()) {
        bmp.Save(ms, ImageFormat.Png);
        return "data:image/png;base64," + Convert.ToBase64String(ms.ToArray());
      }
    }
  }

  public static List<string> ExtractAll(string filePath, int preferredIndex, int maxIcons) {
    var results = new List<string>();
    if (string.IsNullOrEmpty(filePath) || !File.Exists(filePath)) return results;

    if (filePath.EndsWith(".ico", StringComparison.OrdinalIgnoreCase)) {
      try {
        using (var ico = new Icon(filePath, 256, 256)) {
          var b64 = IconToPngBase64(ico);
          if (!string.IsNullOrEmpty(b64)) results.Add(b64);
        }
      } catch {
        try {
          using (var ico = new Icon(filePath)) {
            var b64 = IconToPngBase64(ico);
            if (!string.IsNullOrEmpty(b64)) results.Add(b64);
          }
        } catch {}
      }
      return results;
    }

    uint total = ExtractIconEx(filePath, -1, null, null, 0);
    if (total > 0) {
      int count = (int)Math.Min(total, (uint)maxIcons);
      IntPtr[] large = new IntPtr[count];
      IntPtr[] small = new IntPtr[count];
      uint got = ExtractIconEx(filePath, 0, large, small, (uint)count);

      var order = new List<int>();
      if (preferredIndex >= 0 && preferredIndex < count) order.Add(preferredIndex);
      for (int i = 0; i < count; i++) {
        if (i != preferredIndex) order.Add(i);
      }

      foreach (int idx in order) {
        IntPtr handle = large[idx] != IntPtr.Zero ? large[idx] : small[idx];
        if (handle != IntPtr.Zero) {
          try {
            using (Icon ic = (Icon)Icon.FromHandle(handle).Clone()) {
              var b64 = IconToPngBase64(ic);
              if (!string.IsNullOrEmpty(b64)) results.Add(b64);
            }
          } catch {}
        }
      }

      for (int i = 0; i < count; i++) {
        if (large[i] != IntPtr.Zero) DestroyIcon(large[i]);
        if (small[i] != IntPtr.Zero) DestroyIcon(small[i]);
      }
    }

    if (results.Count == 0) {
      try {
        using (Icon assoc = Icon.ExtractAssociatedIcon(filePath)) {
          var b64 = IconToPngBase64(assoc);
          if (!string.IsNullOrEmpty(b64)) results.Add(b64);
        }
      } catch {}
    }

    return results;
  }
}
"@ -ReferencedAssemblies System.Drawing

$icons = @()
if (Test-Path -LiteralPath $iconSource) {
  $icons = [Launcher59IconHelper]::ExtractAll($iconSource, $iconIndex, ${MAX_EXTRACTED_ICONS})
}
if (($icons.Count -eq 0) -and ($resolvedPath -ne $iconSource) -and (Test-Path -LiteralPath $resolvedPath)) {
  $icons = [Launcher59IconHelper]::ExtractAll($resolvedPath, 0, ${MAX_EXTRACTED_ICONS})
}

$outObj = [PSCustomObject]@{
  resolvedPath = $resolvedPath
  iconSourcePath = $iconSource
  detectedName = $detectedName
  icons = @($icons)
}
$outObj | ConvertTo-Json -Depth 4 -Compress
`;

    execFile(
      'powershell.exe',
      [
        '-NoProfile',
        '-NonInteractive',
        '-ExecutionPolicy',
        'Bypass',
        '-Command',
        psScript,
        '-InputPath',
        inputPath,
      ],
      {
        windowsHide: true,
        timeout: 9000,
        maxBuffer: 12 * 1024 * 1024,
      },
      (err, stdout) => {
        if (err || !stdout) {
          resolve(null);
          return;
        }
        try {
          const parsed = JSON.parse(stdout.trim());
          resolve(parsed);
        } catch {
          resolve(null);
        }
      }
    );
  });
}

/**
 * Looks for sidecar .ico / icon.png files next to an executable if primary extraction yields none.
 */
function findSidecarIconDataUrl(resolvedExePath) {
  try {
    if (!resolvedExePath || !fs.existsSync(resolvedExePath)) return null;
    const dir = path.dirname(resolvedExePath);
    const candidates = [
      path.join(dir, 'icon.png'),
      path.join(dir, 'app.png'),
      path.join(dir, 'icon.ico'),
      path.join(dir, 'app.ico'),
      path.join(dir, 'resources', 'icon.png'),
      path.join(dir, 'resources', 'app.ico'),
    ];
    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        const img = nativeImage.createFromPath(candidate);
        if (!img.isEmpty()) {
          return img.toDataURL();
        }
      }
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Extracts real icons and detects product name from any Windows EXE, LNK, DLL, or ICO.
 */
async function extractAppIcons(rawFilePath) {
  const inputPath = String(rawFilePath || '').trim();
  if (!inputPath) {
    return {
      ok: false,
      originalPath: '',
      resolvedPath: '',
      detectedName: '',
      icons: [],
      primaryIcon: null,
      error: 'مسیر فایل نامعتبر است.',
    };
  }

  let resolvedPath = inputPath;
  let iconSourcePath = inputPath;
  let detectedName = '';
  const uniqueIcons = [];
  const seenHashes = new Set();

  const pushIcon = (dataUrl) => {
    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) return;
    const h = hashString(dataUrl);
    if (!seenHashes.has(h)) {
      seenHashes.add(h);
      uniqueIcons.push(dataUrl);
    }
  };

  // 1. Native Windows Shell32 / WScript.Shell / FileVersionInfo extraction
  const winData = await runWindowsIconExtractionScript(inputPath);
  if (winData) {
    if (winData.resolvedPath) resolvedPath = winData.resolvedPath;
    if (winData.iconSourcePath) iconSourcePath = winData.iconSourcePath;
    if (winData.detectedName) detectedName = String(winData.detectedName).trim();
    if (Array.isArray(winData.icons)) {
      for (const ico of winData.icons) {
        pushIcon(ico);
      }
    }
  }

  // 2. Electron shell native app.getFileIcon (works for UWP, Store, shell links & modern apps)
  const pathsToProbe = resolvedPath !== inputPath ? [resolvedPath, inputPath] : [inputPath];
  for (const probePath of pathsToProbe) {
    if (fs.existsSync(probePath)) {
      try {
        const fileImg = await app.getFileIcon(probePath, { size: 'large' });
        if (fileImg && !fileImg.isEmpty()) {
          pushIcon(fileImg.toDataURL());
        }
      } catch {
        // ignore fallback failure
      }
    }
  }

  // 3. Sidecar package icon fallback if needed
  if (uniqueIcons.length === 0) {
    const sidecar = findSidecarIconDataUrl(resolvedPath);
    if (sidecar) pushIcon(sidecar);
  }

  if (!detectedName) {
    detectedName = sanitizeFileBase(resolvedPath || inputPath);
  }

  return {
    ok: uniqueIcons.length > 0,
    originalPath: inputPath,
    resolvedPath,
    iconSourcePath,
    detectedName,
    icons: uniqueIcons.slice(0, MAX_EXTRACTED_ICONS),
    primaryIcon: uniqueIcons[0] || null,
  };
}

/**
 * Lets the user manually pick a custom icon file (.png, .ico, .svg, .webp, .jpg, .exe, .dll).
 */
async function pickIconImageFile(parentWindow) {
  const result = await dialog.showOpenDialog(parentWindow || undefined, {
    title: 'انتخاب آیکون اختصاصی برنامه',
    properties: ['openFile'],
    filters: [
      { name: 'Icon & Image Files', extensions: ['png', 'ico', 'svg', 'webp', 'jpg', 'jpeg'] },
      { name: 'Windows Executables & Libraries', extensions: ['exe', 'dll', 'lnk'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { ok: false };
  }

  const picked = result.filePaths[0];
  const ext = path.extname(picked).toLowerCase();

  if (ext === '.exe' || ext === '.dll' || ext === '.lnk') {
    const extracted = await extractAppIcons(picked);
    return {
      ok: extracted.ok,
      dataUrl: extracted.primaryIcon || undefined,
      icons: extracted.icons,
      filePath: picked,
      error: extracted.ok ? undefined : 'آیکونی درون فایل انتخاب‌شده یافت نشد.',
    };
  }

  if (ext === '.svg') {
    const raw = fs.readFileSync(picked);
    const dataUrl = `data:image/svg+xml;base64,${raw.toString('base64')}`;
    return { ok: true, dataUrl, icons: [dataUrl], filePath: picked };
  }

  try {
    const img = nativeImage.createFromPath(picked);
    if (!img.isEmpty()) {
      const resized =
        img.getSize().width > 128 || img.getSize().height > 128
          ? img.resize({ width: 128, height: 128, quality: 'best' })
          : img;
      const dataUrl = resized.toDataURL();
      return { ok: true, dataUrl, icons: [dataUrl], filePath: picked };
    }
  } catch {
    // fallback below
  }

  if (ext === '.ico') {
    const extracted = await extractAppIcons(picked);
    if (extracted.ok && extracted.primaryIcon) {
      return { ok: true, dataUrl: extracted.primaryIcon, icons: extracted.icons, filePath: picked };
    }
  }

  return { ok: false, error: 'فرمت فایل آیکون قابل خواندن نبود.' };
}

function saveAppIconToDisk(appId, dataUrl, variant = 'active') {
  try {
    if (!appId || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
      return false;
    }
    const dir = getIconsDirectory();
    const safeId = sanitizeAppId(appId);
    const suffix = variant === 'original' ? '.orig' : '';
    const isSvg = dataUrl.startsWith('data:image/svg+xml');
    const ext = isSvg ? '.svg' : '.png';
    const base64Part = dataUrl.split(',')[1];
    if (!base64Part) return false;
    const targetPath = path.join(dir, `${safeId}${suffix}${ext}`);
    fs.writeFileSync(targetPath, Buffer.from(base64Part, 'base64'));
    return true;
  } catch {
    return false;
  }
}

function deleteAppIconFromDisk(appId) {
  try {
    const dir = getIconsDirectory();
    const safeId = sanitizeAppId(appId);
    for (const file of [
      `${safeId}.png`,
      `${safeId}.svg`,
      `${safeId}.orig.png`,
      `${safeId}.orig.svg`,
    ]) {
      const full = path.join(dir, file);
      if (fs.existsSync(full)) fs.unlinkSync(full);
    }
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  extractAppIcons,
  pickIconImageFile,
  saveAppIconToDisk,
  deleteAppIconFromDisk,
  sanitizeFileBase,
};
