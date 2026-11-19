const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toDisplayDigits(input: string | number, usePersian: boolean): string {
  const str = String(input);
  if (!usePersian) return str;
  return str.replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)] ?? d);
}

export function formatLiveClock(
  date: Date,
  use24Hour: boolean,
  usePersian: boolean
): { time: string; period: string } {
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  let period = '';

  if (!use24Hour) {
    period = hours >= 12 ? 'ب.ظ' : 'ق.ظ';
    hours = hours % 12 || 12;
  }

  const hh = String(hours).padStart(2, '0');
  const raw = `${hh}:${minutes}:${seconds}`;
  return {
    time: toDisplayDigits(raw, usePersian),
    period,
  };
}

export function formatShamsiDate(date: Date, usePersianDigits: boolean): string {
  try {
    const formatted = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
    if (!usePersianDigits) {
      return formatted.replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)));
    }
    return formatted;
  } catch {
    return date.toLocaleDateString('fa-IR');
  }
}

export function formatGregorianDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatRelativeTime(timestamp: number, usePersian: boolean): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (diffSec < 60) return 'هم‌اکنون';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${toDisplayDigits(diffMin, usePersian)} دقیقه پیش`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${toDisplayDigits(diffHr, usePersian)} ساعت پیش`;
  const diffDay = Math.floor(diffHr / 24);
  return `${toDisplayDigits(diffDay, usePersian)} روز پیش`;
}
