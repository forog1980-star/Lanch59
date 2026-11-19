import { DEFAULT_SETTINGS, DEFAULT_SHORTCUTS } from '../data/defaultShortcuts';
import { AppShortcut, LauncherNotification, LauncherSettings } from '../types/launcher';

const KEYS = {
  SHORTCUTS: 'launcher59_shortcuts_v1',
  SETTINGS: 'launcher59_settings_v1',
  NOTIFICATIONS: 'launcher59_notifications_v1',
  NOTES: 'launcher59_notes_v1',
};

export function loadShortcuts(): AppShortcut[] {
  try {
    const raw = localStorage.getItem(KEYS.SHORTCUTS);
    if (!raw) return DEFAULT_SHORTCUTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // fallback
  }
  return DEFAULT_SHORTCUTS;
}

export function saveShortcuts(shortcuts: AppShortcut[]): void {
  try {
    localStorage.setItem(KEYS.SHORTCUTS, JSON.stringify(shortcuts));
  } catch {
    // ignore storage quota errors
  }
}

export function loadSettings(): LauncherSettings {
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: LauncherSettings): void {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function loadNotifications(): LauncherNotification[] {
  try {
    const raw = localStorage.getItem(KEYS.NOTIFICATIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fallback
  }
  return [
    {
      id: 'welcome-59',
      title: 'خوش آمدید به LAUNCHER 59',
      message:
        'تمامی تنظیمات و میانبرهای شما به‌صورت محلی در دستگاه ذخیره می‌شوند و هیچ داده‌ای به سرورهای ابری ارسال نمی‌گردد.',
      timestamp: Date.now(),
      kind: 'info',
      read: false,
    },
    {
      id: 'sandbox-notice',
      title: 'راهنمای اجرای نرم‌افزارهای ویندوز',
      message:
        'برنامه‌های دارای پروتکل (مانند vscode:// یا ms-settings:) مستقیماً باز می‌شوند. برای اجرای فایل‌های exe و خواندن درصد دقیق CPU/RAM ویندوز، می‌توانید از پل محلی ویندوز استفاده کنید.',
      timestamp: Date.now() - 1000 * 60 * 3,
      kind: 'system',
      read: false,
    },
  ];
}

export function saveNotifications(items: LauncherNotification[]): void {
  try {
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(items.slice(0, 30)));
  } catch {
    // ignore
  }
}

export function loadNotes(): string {
  try {
    return localStorage.getItem(KEYS.NOTES) ?? '';
  } catch {
    return '';
  }
}

export function saveNotes(content: string): void {
  try {
    localStorage.setItem(KEYS.NOTES, content);
  } catch {
    // ignore
  }
}
