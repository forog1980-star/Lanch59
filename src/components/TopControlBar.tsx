import React from 'react';
import { Bell, Minus, Settings, Square, Wifi, WifiOff, X } from 'lucide-react';
import avatarImg from '../assets/images/user_profile_avatar_1795005619419.jpg';
import { DesktopInfo } from '../types/desktop';
import { LauncherSettings, SystemMetrics } from '../types/launcher';
import {
  formatGregorianDate,
  formatLiveClock,
  formatShamsiDate,
  toDisplayDigits,
} from '../utils/formatters';

interface TopControlBarProps {
  now: Date;
  settings: LauncherSettings;
  metrics: SystemMetrics;
  unreadCount: number;
  desktopInfo: DesktopInfo | null;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
}

export const TopControlBar: React.FC<TopControlBarProps> = ({
  now,
  settings,
  metrics,
  unreadCount,
  desktopInfo,
  onOpenNotifications,
  onOpenSettings,
  onOpenProfile,
}) => {
  const { time, period } = formatLiveClock(
    now,
    settings.use24HourClock,
    settings.usePersianDigits
  );
  const shamsiDate = formatShamsiDate(now, settings.usePersianDigits);
  const gregorianDate = formatGregorianDate(now);

  return (
    <header
      className="w-full max-w-[1380px] mx-auto px-4 sm:px-8 pt-4 sm:pt-5"
      style={desktopInfo ? ({ WebkitAppRegion: 'drag' } as React.CSSProperties) : undefined}
    >
      <div className="acrylic-surface rounded-2xl px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 sm:gap-8">
        <button
          type="button"
          onClick={onOpenProfile}
          style={desktopInfo ? ({ WebkitAppRegion: 'no-drag' } as React.CSSProperties) : undefined}
          className="group flex items-center gap-3 text-right rounded-xl px-2 py-1.5 -mr-2 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#65D5FF] shrink-0"
          title="ویرایش پروفایل محلی"
        >
          <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#B9DDFF]/40 bg-gradient-to-br from-[#0078D4] to-[#071D3A] flex items-center justify-center shrink-0 shadow-sm">
            <img
              src={avatarImg}
              alt={settings.userName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-sm font-medium text-[#F5FAFF] whitespace-nowrap">
              {settings.userName}
            </span>
            <span className="text-xs text-[#B9DDFF]/75 whitespace-nowrap">
              {settings.userRole}
            </span>
          </div>
        </button>

        <div className="flex items-center gap-3 sm:gap-5 min-w-0">
          <div className="flex items-baseline gap-1.5" dir="ltr">
            <span className="font-mono-tabular text-lg sm:text-xl font-semibold tracking-tight text-[#F5FAFF] whitespace-nowrap">
              {time}
            </span>
            {period && (
              <span className="text-xs text-[#B9DDFF]/80 font-medium whitespace-nowrap">
                {period}
              </span>
            )}
          </div>
          <span className="hidden md:inline text-[#B9DDFF]/35 select-none" aria-hidden="true">
            |
          </span>
          <div className="hidden md:flex items-center gap-2 text-xs sm:text-sm text-[#B9DDFF]/90 truncate">
            <span className="whitespace-nowrap">{shamsiDate}</span>
            {settings.showGregorianDate && (
              <>
                <span className="text-[#B9DDFF]/45" aria-hidden="true">
                  ·
                </span>
                <span dir="ltr" className="text-xs text-[#B9DDFF]/70 whitespace-nowrap font-display">
                  {gregorianDate}
                </span>
              </>
            )}
          </div>
        </div>

        <div
          className="flex items-center gap-2 sm:gap-2.5 shrink-0"
          style={desktopInfo ? ({ WebkitAppRegion: 'no-drag' } as React.CSSProperties) : undefined}
        >
          <div
            className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#B9DDFF]/90"
            title={metrics.online ? 'اتصال شبکه برقرار است' : 'اتصال اینترنت قطع است'}
          >
            {metrics.online ? (
              <Wifi className="w-4 h-4 text-[#65D5FF]" strokeWidth={1.75} />
            ) : (
              <WifiOff className="w-4 h-4 text-amber-300" strokeWidth={1.75} />
            )}
            <span className="whitespace-nowrap">
              {metrics.online ? 'متصل' : 'آفلاین'}
              {metrics.online && metrics.connectionType
                ? ` · ${metrics.connectionType.toUpperCase()}`
                : ''}
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenNotifications}
            className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#F5FAFF] hover:bg-white/12 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#65D5FF] whitespace-nowrap shrink-0"
            aria-label="اعلان‌ها"
          >
            <Bell className="w-4 h-4 text-[#B9DDFF]" strokeWidth={1.8} />
            <span className="hidden sm:inline">اعلان‌ها</span>
            {unreadCount > 0 && (
              <span className="text-[11px] font-mono-tabular text-[#65D5FF] font-semibold">
                ({toDisplayDigits(unreadCount, settings.usePersianDigits)})
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#F5FAFF] bg-[#0078D4]/45 hover:bg-[#0078D4]/65 border border-[#65D5FF]/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#65D5FF] whitespace-nowrap shrink-0"
            aria-label="تنظیمات"
          >
            <Settings className="w-4 h-4 text-[#F5FAFF]" strokeWidth={1.8} />
            <span className="hidden sm:inline">تنظیمات</span>
          </button>

          {desktopInfo && window.launcher59Desktop && (
            <div className="flex items-center gap-1 pr-2 mr-1 border-r border-[#B9DDFF]/20">
              <button
                type="button"
                onClick={() => window.launcher59Desktop?.windowAction('minimize')}
                className="p-2 rounded-lg hover:bg-white/12 text-[#B9DDFF] hover:text-[#F5FAFF] transition-colors"
                aria-label="کوچک کردن پنجره"
                title="کوچک کردن"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => window.launcher59Desktop?.windowAction('maximize')}
                className="p-2 rounded-lg hover:bg-white/12 text-[#B9DDFF] hover:text-[#F5FAFF] transition-colors"
                aria-label="بزرگ‌نمایی پنجره"
                title="تغییر اندازه"
              >
                <Square className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => window.launcher59Desktop?.windowAction('close')}
                className="p-2 rounded-lg hover:bg-rose-500/75 text-[#B9DDFF] hover:text-white transition-colors"
                aria-label="بستن برنامه"
                title="بستن"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
