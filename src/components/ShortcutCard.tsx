import React, { useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Globe,
  Maximize2,
  Minimize2,
  Pin,
  PinOff,
  Trash2,
} from 'lucide-react';
import { AppShortcut, LauncherSettings } from '../types/launcher';
import { formatRelativeTime, toDisplayDigits } from '../utils/formatters';
import { AppIcon } from './icons/AppIcon';

interface ShortcutCardProps {
  shortcut: AppShortcut;
  settings: LauncherSettings;
  bridgeConnected: boolean;
  editMode: boolean;
  canMovePrev: boolean;
  canMoveNext: boolean;
  onLaunch: (shortcut: AppShortcut, preferFallbackWeb?: boolean) => void;
  onMove: (id: string, direction: 'prev' | 'next') => void;
  onToggleSize: (id: string) => void;
  onTogglePin: (id: string) => void;
  onEdit: (shortcut: AppShortcut) => void;
  onDelete: (id: string) => void;
}

export const ShortcutCard: React.FC<ShortcutCardProps> = ({
  shortcut,
  settings,
  bridgeConnected,
  editMode,
  canMovePrev,
  canMoveNext,
  onLaunch,
  onMove,
  onToggleSize,
  onTogglePin,
  onEdit,
  onDelete,
}) => {
  const [spot, setSpot] = useState<{ x: number; y: number; active: boolean }>({
    x: 50,
    y: 50,
    active: false,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (settings.reduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setSpot({ x, y, active: true });
  };

  const handleMouseLeave = () => {
    setSpot((prev) => ({ ...prev, active: false }));
  };

  const launchModeLabel =
    shortcut.launchType === 'web'
      ? 'وب‌اپ'
      : shortcut.launchType === 'bridge'
        ? bridgeConnected
          ? 'پل ویندوز فعال'
          : 'نیازمند پل ویندوز'
        : 'پروتکل ویندوز';

  const isFeatured = shortcut.size === 'featured';

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group relative acrylic-card rounded-2xl p-5 flex flex-col justify-between min-h-[168px] overflow-hidden ${
        isFeatured ? 'sm:col-span-2' : ''
      }`}
    >
      {/* Dynamic Hover Spotlight */}
      {!settings.reduceMotion && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-200"
          style={{
            opacity: spot.active ? 1 : 0,
            background: `radial-gradient(280px circle at ${spot.x}% ${spot.y}%, rgba(101, 213, 255, 0.16), transparent 65%)`,
          }}
        />
      )}

      {/* Main Clickable Area when not in Edit Mode */}
      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => !editMode && onLaunch(shortcut)}
            disabled={editMode}
            className="flex items-center gap-3.5 text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#65D5FF] rounded-xl disabled:cursor-default"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#38A9FF]/28 to-[#0078D4]/30 border border-[#B9DDFF]/30 flex items-center justify-center text-[#F5FAFF] shadow-inner shrink-0 group-hover:border-[#65D5FF]/55 transition-colors">
              <AppIcon iconKey={shortcut.iconKey} className="w-6 h-6 text-[#EBF6FF]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-[#F5FAFF] leading-snug truncate">
                {shortcut.name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-[#B9DDFF]/75 mt-0.5">
                <span dir="ltr" className="font-display truncate">
                  {shortcut.englishName}
                </span>
                <span aria-hidden="true">·</span>
                <span className="whitespace-nowrap">{launchModeLabel}</span>
              </div>
            </div>
          </button>

          {/* Direct Launch Arrow or Web Fallback */}
          {!editMode && (
            <div className="flex items-center gap-1 shrink-0">
              {shortcut.fallbackWebUrl && (
                <button
                  type="button"
                  onClick={() => onLaunch(shortcut, true)}
                  className="p-2 rounded-lg text-[#B9DDFF]/70 hover:text-[#F5FAFF] hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#65D5FF]"
                  title="باز کردن نسخه وب"
                  aria-label={`باز کردن نسخه وب ${shortcut.name}`}
                >
                  <Globe className="w-4 h-4" strokeWidth={1.75} />
                </button>
              )}
              <button
                type="button"
                onClick={() => onLaunch(shortcut)}
                className="p-2 rounded-lg text-[#65D5FF]/85 hover:text-[#F5FAFF] hover:bg-[#0078D4]/45 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#65D5FF]"
                title={`اجرای ${shortcut.name}`}
                aria-label={`اجرای ${shortcut.name}`}
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={1.85} />
              </button>
            </div>
          )}
        </div>

        <p
          onClick={() => !editMode && onLaunch(shortcut)}
          className={`text-xs sm:text-[13px] text-[#D4E9FF]/80 leading-relaxed line-clamp-2 ${
            !editMode ? 'cursor-pointer' : ''
          }`}
        >
          {shortcut.description}
        </p>
      </div>

      {/* Footer: Usage Metadata OR Edit Controls */}
      <div className="relative z-10 mt-4 pt-3 border-t border-[#B9DDFF]/12 flex items-center justify-between gap-2">
        {editMode ? (
          <div className="flex items-center justify-between w-full gap-1.5">
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={!canMovePrev}
                onClick={() => onMove(shortcut.id, 'prev')}
                className="p-1.5 rounded-lg bg-white/8 hover:bg-white/15 disabled:opacity-30 text-[#F5FAFF] transition-colors"
                title="جابه‌جایی به قبل"
                aria-label="جابه‌جایی به قبل"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={!canMoveNext}
                onClick={() => onMove(shortcut.id, 'next')}
                className="p-1.5 rounded-lg bg-white/8 hover:bg-white/15 disabled:opacity-30 text-[#F5FAFF] transition-colors"
                title="جابه‌جایی به بعد"
                aria-label="جابه‌جایی به بعد"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onToggleSize(shortcut.id)}
                className="p-1.5 rounded-lg bg-white/8 hover:bg-white/15 text-[#B9DDFF] hover:text-[#F5FAFF] transition-colors"
                title={isFeatured ? 'تغییر به اندازه معمولی' : 'تغییر به کارت بزرگ'}
                aria-label="تغییر اندازه کارت"
              >
                {isFeatured ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => onTogglePin(shortcut.id)}
                className={`p-1.5 rounded-lg transition-colors ${
                  shortcut.pinnedToDock
                    ? 'bg-[#0078D4]/55 text-[#F5FAFF]'
                    : 'bg-white/8 text-[#B9DDFF] hover:bg-white/15'
                }`}
                title={shortcut.pinnedToDock ? 'برداشتن از نوار پایین' : 'سنجاق به نوار پایین'}
                aria-label="سنجاق به نوار پایین"
              >
                {shortcut.pinnedToDock ? (
                  <PinOff className="w-4 h-4" />
                ) : (
                  <Pin className="w-4 h-4" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onEdit(shortcut)}
                className="p-1.5 rounded-lg bg-white/8 hover:bg-[#0078D4]/55 text-[#F5FAFF] transition-colors"
                title="ویرایش میانبر"
                aria-label="ویرایش میانبر"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(shortcut.id)}
                className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/35 text-rose-200 transition-colors"
                title="حذف میانبر"
                aria-label="حذف میانبر"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 text-[11px] text-[#B9DDFF]/70 min-w-0 truncate">
              <span dir="ltr" className="font-mono-tabular truncate">
                {shortcut.target}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#B9DDFF]/75 whitespace-nowrap shrink-0 tabular-nums">
              {shortcut.lastLaunchedAt ? (
                <span>{formatRelativeTime(shortcut.lastLaunchedAt, settings.usePersianDigits)}</span>
              ) : (
                <span>آماده اجرا</span>
              )}
              {shortcut.launchCount > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    {toDisplayDigits(shortcut.launchCount, settings.usePersianDigits)} اجرا
                  </span>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
