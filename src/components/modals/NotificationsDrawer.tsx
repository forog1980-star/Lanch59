import React from 'react';
import { Bell, CheckCheck, Info, Rocket, ShieldAlert, Trash2, X } from 'lucide-react';
import { LauncherNotification } from '../../types/launcher';
import { formatRelativeTime } from '../../utils/formatters';

interface NotificationsDrawerProps {
  open: boolean;
  notifications: LauncherNotification[];
  usePersianDigits: boolean;
  onClose: () => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  open,
  notifications,
  usePersianDigits,
  onClose,
  onMarkAllRead,
  onClearAll,
}) => {
  if (!open) return null;

  const renderIcon = (kind: LauncherNotification['kind']) => {
    switch (kind) {
      case 'launch':
        return <Rocket className="w-4 h-4 text-[#65D5FF]" />;
      case 'warning':
        return <ShieldAlert className="w-4 h-4 text-amber-300" />;
      case 'system':
        return <Info className="w-4 h-4 text-[#8DABFF]" />;
      default:
        return <Bell className="w-4 h-4 text-[#B9DDFF]" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#041124]/55 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="پنل اعلان‌ها"
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md h-full acrylic-modal border-r border-[#B9DDFF]/25 p-5 flex flex-col justify-between"
      >
        <div className="flex flex-col h-full min-h-0">
          <div className="flex items-center justify-between pb-4 border-b border-[#B9DDFF]/15">
            <div className="flex items-center gap-2.5">
              <Bell className="w-5 h-5 text-[#65D5FF]" />
              <h2 className="text-base font-semibold text-[#F5FAFF]">اعلان‌ها و رویدادها</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 text-[#B9DDFF] hover:text-[#F5FAFF] transition-colors"
              aria-label="بستن پنل اعلان‌ها"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 py-3">
            <button
              type="button"
              onClick={onMarkAllRead}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#B9DDFF] hover:text-[#F5FAFF] hover:bg-white/10 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>خوانده‌شده</span>
            </button>
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-rose-200/85 hover:text-rose-100 hover:bg-rose-500/15 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>پاک کردن همه</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {notifications.length === 0 ? (
              <div className="py-16 text-center text-sm text-[#B9DDFF]/65">
                هیچ اعلان فعالی وجود ندارد.
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-xl p-3.5 border transition-colors ${
                    item.read
                      ? 'bg-white/4 border-[#B9DDFF]/12'
                      : 'bg-[#0078D4]/20 border-[#65D5FF]/35'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 shrink-0">{renderIcon(item.kind)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-xs font-semibold text-[#F5FAFF] truncate">
                          {item.title}
                        </h3>
                        <span className="text-[11px] text-[#B9DDFF]/65 whitespace-nowrap shrink-0">
                          {formatRelativeTime(item.timestamp, usePersianDigits)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#D4E9FF]/80 leading-relaxed">
                        {item.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};
