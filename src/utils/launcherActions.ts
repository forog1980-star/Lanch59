import { AppShortcut } from '../types/launcher';

export interface LaunchResult {
  ok: boolean;
  mode: 'desktop' | 'bridge' | 'uri' | 'web' | 'blocked';
  message: string;
}

export async function executeShortcutLaunch(
  shortcut: AppShortcut,
  bridgeUrl: string,
  bridgeConnected: boolean,
  preferFallbackWeb = false
): Promise<LaunchResult> {
  if (typeof window !== 'undefined' && window.launcher59Desktop) {
    const res = await window.launcher59Desktop.launchTarget({
      launchType: shortcut.launchType,
      target: shortcut.target,
      bridgeCommand: shortcut.bridgeCommand,
      preferWeb: preferFallbackWeb,
      fallbackWebUrl: shortcut.fallbackWebUrl,
    });
    return {
      ok: res.ok,
      mode: res.ok ? 'desktop' : 'blocked',
      message: res.message,
    };
  }

  if (preferFallbackWeb && shortcut.fallbackWebUrl) {
    const a = document.createElement('a');
    a.href = shortcut.fallbackWebUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
    return {
      ok: true,
      mode: 'web',
      message: `نسخه وب «${shortcut.name}» در زبانه جدید باز شد.`,
    };
  }

  if (bridgeConnected && (shortcut.launchType === 'bridge' || shortcut.bridgeCommand)) {
    const command = shortcut.bridgeCommand || shortcut.target;
    const cleanBase = bridgeUrl.replace(/\/+$/, '');
    try {
      const res = await fetch(`${cleanBase}/launch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });
      if (res.ok) {
        return {
          ok: true,
          mode: 'bridge',
          message: `«${shortcut.name}» از طریق پل محلی ویندوز اجرا شد.`,
        };
      }
    } catch {
      // Fall through
    }
  }

  if (shortcut.launchType === 'web') {
    const a = document.createElement('a');
    a.href = shortcut.target;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
    return {
      ok: true,
      mode: 'web',
      message: `نشانی وب «${shortcut.name}» باز شد.`,
    };
  }

  if (shortcut.launchType === 'uri') {
    try {
      const a = document.createElement('a');
      a.href = shortcut.target;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return {
        ok: true,
        mode: 'uri',
        message: `درخواست اجرای پروتکل دسکتاپ (${shortcut.target}) به ویندوز ارسال شد.`,
      };
    } catch {
      return {
        ok: false,
        mode: 'blocked',
        message: `مرورگر اجرای مستقیم پروتکل ${shortcut.target} را محدود کرد.`,
      };
    }
  }

  return {
    ok: false,
    mode: 'blocked',
    message: `اجرای مستقیم فایل سیستمی «${shortcut.target}» در محیط مرورگر ممکن نیست. برای اجرای واقعی، نسخه دسکتاپ یا پل محلی ویندوز را فعال کنید.`,
  };
}
