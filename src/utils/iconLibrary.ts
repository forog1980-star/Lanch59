import { AppIconSource, AppShortcut, IconKey } from '../types/launcher';

export interface StoredAppIconEntry {
  appId: string;
  activeDataUrl?: string;
  originalDataUrl?: string;
  extractedVariants?: string[];
  source: AppIconSource;
  brandIconKey?: string;
  extractedFrom?: string;
  updatedAt: number;
}

export type IconLibraryMap = Record<string, StoredAppIconEntry>;

const ICON_LIBRARY_STORAGE_KEY = 'launcher59_icon_library_v1';

export interface DetectedAppIdentity {
  suggestedName: string;
  suggestedEnglishName: string;
  brandIconKey?: string;
  fallbackIconKey: IconKey;
}

interface KnownWindowsAppSignature {
  match: RegExp;
  brandIconKey: string;
  fallbackIconKey: IconKey;
  persianName: string;
  englishName: string;
}

/**
 * High-priority recognition table for common Windows applications.
 * This never restricts users to a fixed list — ANY arbitrary Windows .exe/.lnk works via real icon extraction
 * or clean monogram fallback, while well-known apps also get crisp built-in recognition immediately.
 */
const KNOWN_APP_SIGNATURES: KnownWindowsAppSignature[] = [
  {
    match: /(?:^|[\\/])winword(?:\.exe)?$|\bmicrosoft\s*word\b/i,
    brandIconKey: 'word',
    fallbackIconKey: 'notes',
    persianName: 'مایکروسافت ورد',
    englishName: 'Microsoft Word',
  },
  {
    match: /(?:^|[\\/])excel(?:\.exe)?$|\bmicrosoft\s*excel\b/i,
    brandIconKey: 'excel',
    fallbackIconKey: 'layers',
    persianName: 'مایکروسافت اکسل',
    englishName: 'Microsoft Excel',
  },
  {
    match: /(?:^|[\\/])powerpnt(?:\.exe)?$|\bpowerpoint\b/i,
    brandIconKey: 'powerpoint',
    fallbackIconKey: 'layers',
    persianName: 'پاورپوینت',
    englishName: 'Microsoft PowerPoint',
  },
  {
    match: /(?:^|[\\/])chrome(?:\.exe)?$|\bgoogle\s*chrome\b/i,
    brandIconKey: 'chrome',
    fallbackIconKey: 'browser',
    persianName: 'گوگل کروم',
    englishName: 'Google Chrome',
  },
  {
    match: /(?:^|[\\/])msedge(?:\.exe)?$|\bmicrosoft\s*edge\b/i,
    brandIconKey: 'edge',
    fallbackIconKey: 'browser',
    persianName: 'مایکروسافت اج',
    englishName: 'Microsoft Edge',
  },
  {
    match: /(?:^|[\\/])firefox(?:\.exe)?$|\bfirefox\b/i,
    brandIconKey: 'firefox',
    fallbackIconKey: 'browser',
    persianName: 'فایرفاکس',
    englishName: 'Mozilla Firefox',
  },
  {
    match: /(?:^|[\\/])(?:powershell|pwsh)(?:\.exe)?$|\bpowershell\b/i,
    brandIconKey: 'powershell',
    fallbackIconKey: 'terminal',
    persianName: 'پاورشل',
    englishName: 'PowerShell',
  },
  {
    match: /(?:^|[\\/])explorer(?:\.exe)?$|\bfile\s*explorer\b/i,
    brandIconKey: 'explorer',
    fallbackIconKey: 'folder',
    persianName: 'مدیریت فایل ویندوز',
    englishName: 'File Explorer',
  },
  {
    match: /(?:^|[\\/])notepad(?:\+\+)?(?:\.exe)?$|\bnotepad\b/i,
    brandIconKey: 'notepad',
    fallbackIconKey: 'notes',
    persianName: 'دفترچه یادداشت',
    englishName: 'Notepad',
  },
  {
    match: /(?:^|[\\/])calc(?:ulator)?(?:\.exe)?$|^calculator:|\bcalculator\b/i,
    brandIconKey: 'calculator',
    fallbackIconKey: 'calculator',
    persianName: 'ماشین‌حساب',
    englishName: 'Calculator',
  },
  {
    match: /(?:^|[\\/])mspaint(?:\.exe)?$|\bpaint\b/i,
    brandIconKey: 'paint',
    fallbackIconKey: 'figma',
    persianName: 'نقاشی ویندوز',
    englishName: 'Paint',
  },
  {
    match: /(?:^|[\\/])code(?:\.exe)?$|^vscode:|\bvs\s*code\b|\bvisual\s*studio\s*code\b/i,
    brandIconKey: 'vscode',
    fallbackIconKey: 'code',
    persianName: 'ویژوال استودیو کد',
    englishName: 'VS Code',
  },
  {
    match: /(?:^|[\\/])wt(?:\.exe)?$|^wt:|\bwindows\s*terminal\b/i,
    brandIconKey: 'terminal',
    fallbackIconKey: 'terminal',
    persianName: 'ترمینال ویندوز',
    englishName: 'Windows Terminal',
  },
  {
    match: /(?:^|[\\/])cmd(?:\.exe)?$|\bcommand\s*prompt\b/i,
    brandIconKey: 'cmd',
    fallbackIconKey: 'command',
    persianName: 'خط فرمان',
    englishName: 'Command Prompt',
  },
  {
    match: /(?:^|[\\/])outlook(?:\.exe)?$|^outlookmail:|\boutlook\b/i,
    brandIconKey: 'outlook',
    fallbackIconKey: 'mail',
    persianName: 'اوت‌لوک',
    englishName: 'Outlook',
  },
  {
    match: /^ms-settings:|\bwindows\s*settings\b/i,
    brandIconKey: 'win-settings',
    fallbackIconKey: 'settings',
    persianName: 'تنظیمات ویندوز ۱۱',
    englishName: 'Windows Settings',
  },
  {
    match: /(?:^|[\\/])photoshop(?:\.exe)?$|\bphotoshop\b/i,
    brandIconKey: 'photoshop',
    fallbackIconKey: 'figma',
    persianName: 'فتوشاپ',
    englishName: 'Adobe Photoshop',
  },
  {
    match: /(?:^|[\\/])telegram(?:\.exe)?$|\btelegram\b/i,
    brandIconKey: 'telegram',
    fallbackIconKey: 'globe',
    persianName: 'تلگرام',
    englishName: 'Telegram',
  },
];

function cleanExecutableBaseName(rawTarget: string): string {
  const leaf = rawTarget.trim().split(/[/\\]/).pop() || rawTarget.trim();
  const noExt = leaf.replace(/\.(exe|lnk|bat|cmd|msc|appref-ms)$/i, '');
  if (!noExt) return 'Application';
  return noExt
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Identifies suggested app display name and optional brand icon key from any executable path, LNK, URI, or URL.
 */
export function detectAppIdentity(rawTarget: string, detectedOsName?: string): DetectedAppIdentity {
  const probe = `${rawTarget || ''} ${detectedOsName || ''}`.trim();
  for (const sig of KNOWN_APP_SIGNATURES) {
    if (sig.match.test(rawTarget.trim()) || (detectedOsName && sig.match.test(detectedOsName))) {
      return {
        suggestedName: detectedOsName?.trim() || sig.persianName,
        suggestedEnglishName: detectedOsName?.trim() || sig.englishName,
        brandIconKey: sig.brandIconKey,
        fallbackIconKey: sig.fallbackIconKey,
      };
    }
  }

  const cleaned = detectedOsName?.trim() || cleanExecutableBaseName(rawTarget);
  const lower = probe.toLowerCase();
  let fallbackIconKey: IconKey = 'command';
  if (/^https?:\/\//.test(lower)) fallbackIconKey = 'globe';
  else if (/studio|dev|ide|git|python|node/.test(lower)) fallbackIconKey = 'code';
  else if (/music|audio|player|vlc|media|spot/.test(lower)) fallbackIconKey = 'music';
  else if (/mail|thunder|inbox/.test(lower)) fallbackIconKey = 'mail';
  else if (/note|doc|pdf|office|writer|text/.test(lower)) fallbackIconKey = 'notes';
  else if (/paint|design|draw|photo|illustrator|blender/.test(lower)) fallbackIconKey = 'figma';
  else if (/folder|file|zip|rar|7z/.test(lower)) fallbackIconKey = 'folder';
  else if (/term|shell|bash|ssh|console/.test(lower)) fallbackIconKey = 'terminal';

  return {
    suggestedName: cleaned,
    suggestedEnglishName: cleaned,
    brandIconKey: undefined,
    fallbackIconKey,
  };
}

/**
 * Resolves the best non-generic brandIconKey for an existing shortcut (useful for default shortcuts & upgrades).
 */
export function resolveBrandIconKeyForShortcut(shortcut: AppShortcut): string | undefined {
  if (shortcut.brandIconKey) return shortcut.brandIconKey;
  const check = detectAppIdentity(
    shortcut.bridgeCommand || shortcut.target,
    shortcut.englishName || shortcut.name
  );
  return check.brandIconKey;
}

/**
 * Generates a deterministic, distinct color palette for an app's unique monogram fallback
 * so two unknown apps never share an identical generic placeholder.
 */
export function getUniqueMonogramPalette(seed: string): { bg: string; border: string; initials: string } {
  const clean = (seed || 'A').trim();
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash * 31 + clean.charCodeAt(i)) >>> 0;
  }
  const hue = hash % 360;
  const words = clean.split(/\s+/).filter(Boolean);
  const initials =
    words.length >= 2
      ? `${words[0][0]}${words[1][0]}`.toUpperCase()
      : clean.slice(0, 2).toUpperCase();

  return {
    bg: `linear-gradient(135deg, hsla(${hue}, 78%, 54%, 0.85), hsla(${(hue + 28) % 360}, 74%, 36%, 0.92))`,
    border: `hsla(${hue}, 86%, 72%, 0.62)`,
    initials,
  };
}

export function loadIconLibrary(): IconLibraryMap {
  try {
    const raw = localStorage.getItem(ICON_LIBRARY_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as IconLibraryMap;
    }
  } catch {
    // ignore corrupted cache
  }
  return {};
}

export function saveIconLibrary(library: IconLibraryMap): void {
  try {
    localStorage.setItem(ICON_LIBRARY_STORAGE_KEY, JSON.stringify(library));
  } catch {
    // ignore storage quota errors
  }
}

export function upsertIconLibraryEntry(
  library: IconLibraryMap,
  entry: StoredAppIconEntry
): IconLibraryMap {
  return {
    ...library,
    [entry.appId]: {
      ...library[entry.appId],
      ...entry,
      updatedAt: Date.now(),
    },
  };
}

export function removeIconLibraryEntry(library: IconLibraryMap, appId: string): IconLibraryMap {
  if (!(appId in library)) return library;
  const next = { ...library };
  delete next[appId];
  return next;
}

/**
 * Resolves an uploaded browser/custom image file (.png, .svg, .ico, .webp, .jpg) to a crisp
 * transparency-preserving PNG or SVG data URL scaled safely to <= 128x128 for fast local storage.
 */
export async function normalizeUploadedIconFile(file: File): Promise<string> {
  const maxBytes = 4 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error('حجم فایل آیکون نباید بیشتر از ۴ مگابایت باشد.');
  }

  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('خواندن فایل آیکون ناموفق بود.'));
    reader.readAsDataURL(file);
  });

  if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
    return rawDataUrl;
  }

  // Rasterize PNG/ICO/WEBP/JPEG onto a 128x128 transparent canvas preserving aspect ratio & alpha
  return await new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const size = 128;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawDataUrl);
          return;
        }
        ctx.clearRect(0, 0, size, size);
        const scale = Math.min(size / img.width, size / img.height);
        const drawW = Math.round(img.width * scale);
        const drawH = Math.round(img.height * scale);
        const dx = Math.round((size - drawW) / 2);
        const dy = Math.round((size - drawH) / 2);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, dx, dy, drawW, drawH);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(rawDataUrl);
      }
    };
    img.onerror = () => resolve(rawDataUrl);
    img.src = rawDataUrl;
  });
}

export const KNOWN_BRAND_ICON_OPTIONS: { key: string; label: string }[] = [
  { key: 'word', label: 'Word' },
  { key: 'excel', label: 'Excel' },
  { key: 'powerpoint', label: 'PowerPoint' },
  { key: 'chrome', label: 'Chrome' },
  { key: 'edge', label: 'Edge' },
  { key: 'firefox', label: 'Firefox' },
  { key: 'powershell', label: 'PowerShell' },
  { key: 'explorer', label: 'Explorer' },
  { key: 'notepad', label: 'Notepad' },
  { key: 'calculator', label: 'Calculator' },
  { key: 'paint', label: 'Paint' },
  { key: 'vscode', label: 'VS Code' },
  { key: 'terminal', label: 'Terminal' },
  { key: 'outlook', label: 'Outlook' },
  { key: 'win-settings', label: 'Settings' },
  { key: 'photoshop', label: 'Photoshop' },
  { key: 'telegram', label: 'Telegram' },
];
