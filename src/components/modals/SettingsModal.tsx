import React, { useEffect, useRef, useState } from 'react';
import { Download, FolderCog, RotateCcw, Settings, Upload, X } from 'lucide-react';
import { DesktopInfo } from '../../types/desktop';
import { AppShortcut, LauncherSettings } from '../../types/launcher';

interface SettingsModalProps {
  open: boolean;
  settings: LauncherSettings;
  shortcuts: AppShortcut[];
  desktopInfo: DesktopInfo | null;
  onClose: () => void;
  onUpdateSettings: (partial: Partial<LauncherSettings>) => void;
  onImportBackup: (data: { settings?: LauncherSettings; shortcuts?: AppShortcut[] }) => void;
  onResetDefaults: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  settings,
  shortcuts,
  desktopInfo,
  onClose,
  onUpdateSettings,
  onImportBackup,
  onResetDefaults,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [autoStart, setAutoStart] = useState(false);

  useEffect(() => {
    if (open && window.launcher59Desktop) {
      window.launcher59Desktop.getAutoStart().then(setAutoStart).catch(() => {});
    }
  }, [open]);

  if (!open) return null;

  const handleToggleAutoStart = async (checked: boolean) => {
    if (!window.launcher59Desktop) return;
    const updated = await window.launcher59Desktop.setAutoStart(checked);
    setAutoStart(updated);
  };

  const handleExport = () => {
    const payload = JSON.stringify(
      { settings, shortcuts, exportedAt: new Date().toISOString() },
      null,
      2
    );
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'launcher59-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        onImportBackup(parsed);
      } catch {
        // invalid json ignored safely
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#041124]/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="تنظیمات LAUNCHER 59"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl acrylic-modal rounded-2xl p-6 max-h-[88vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#B9DDFF]/15">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-[#65D5FF]" />
            <h2 className="text-base font-semibold text-[#F5FAFF]">تنظیمات داشبورد LAUNCHER 59</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-[#B9DDFF] hover:text-[#F5FAFF] transition-colors"
            aria-label="بستن تنظیمات"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {desktopInfo && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-[#65D5FF]">تنظیمات سیستم‌عامل ویندوز</h3>

              <label className="flex items-center justify-between gap-4 p-3 rounded-xl bg-white/5 border border-[#B9DDFF]/14 cursor-pointer">
                <div>
                  <div className="text-sm font-medium text-[#F5FAFF]">
                    اجرای خودکار هنگام شروع ویندوز
                  </div>
                  <div className="text-xs text-[#B9DDFF]/70 mt-0.5">
                    باز شدن اختیاری LAUNCHER 59 پس از ورود به حساب کاربری ویندوز
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoStart}
                  onChange={(e) => handleToggleAutoStart(e.target.checked)}
                  className="w-4 h-4 accent-[#38A9FF]"
                />
              </label>

              <div className="p-3 rounded-xl bg-white/5 border border-[#B9DDFF]/14 flex items-start gap-2.5">
                <FolderCog className="w-4 h-4 text-[#65D5FF] mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-[#F5FAFF]">
                    مسیر محلی ذخیره‌سازی داده‌ها و تنظیمات:
                  </div>
                  <div
                    dir="ltr"
                    className="text-[11px] font-mono-tabular text-[#B9DDFF]/80 mt-1 break-all"
                  >
                    {desktopInfo.userDataPath}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-[#65D5FF]">موشن و جلوه‌های بصری</h3>

            <label className="flex items-center justify-between gap-4 p-3 rounded-xl bg-white/5 border border-[#B9DDFF]/14 cursor-pointer">
              <div>
                <div className="text-sm font-medium text-[#F5FAFF]">کاهش افکت‌های حرکتی</div>
                <div className="text-xs text-[#B9DDFF]/70 mt-0.5">
                  توقف چرخش حلقه‌های هاله، ذرات نوری و حرکت پارالاکس برای تمرکز بیشتر
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.reduceMotion}
                onChange={(e) => onUpdateSettings({ reduceMotion: e.target.checked })}
                className="w-4 h-4 accent-[#38A9FF]"
              />
            </label>

            <div className="p-3 rounded-xl bg-white/5 border border-[#B9DDFF]/14">
              <div className="text-sm font-medium text-[#F5FAFF] mb-2">شدت نور هاله مرکزی ۵۹</div>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { key: 'subtle', label: 'ملایم' },
                    { key: 'balanced', label: 'متعادل' },
                    { key: 'radiant', label: 'درخشان' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => onUpdateSettings({ haloIntensity: opt.key })}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                      settings.haloIntensity === opt.key
                        ? 'bg-[#0078D4] border-[#65D5FF]/50 text-[#F5FAFF]'
                        : 'bg-white/5 border-[#B9DDFF]/15 text-[#B9DDFF] hover:bg-white/10'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-[#65D5FF]">ساعت، تاریخ و اعداد</h3>

            <label className="flex items-center justify-between gap-4 p-3 rounded-xl bg-white/5 border border-[#B9DDFF]/14 cursor-pointer">
              <div>
                <div className="text-sm font-medium text-[#F5FAFF]">قالب ۲۴ ساعته</div>
                <div className="text-xs text-[#B9DDFF]/70 mt-0.5">
                  نمایش ساعت به‌صورت ۲۴ ساعته به‌جای ق.ظ / ب.ظ
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.use24HourClock}
                onChange={(e) => onUpdateSettings({ use24HourClock: e.target.checked })}
                className="w-4 h-4 accent-[#38A9FF]"
              />
            </label>

            <label className="flex items-center justify-between gap-4 p-3 rounded-xl bg-white/5 border border-[#B9DDFF]/14 cursor-pointer">
              <div>
                <div className="text-sm font-medium text-[#F5FAFF]">اعداد فارسی</div>
                <div className="text-xs text-[#B9DDFF]/70 mt-0.5">
                  نمایش ساعت، تاریخ و آمار به ارقام فارسی (۰-۹)
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.usePersianDigits}
                onChange={(e) => onUpdateSettings({ usePersianDigits: e.target.checked })}
                className="w-4 h-4 accent-[#38A9FF]"
              />
            </label>

            <label className="flex items-center justify-between gap-4 p-3 rounded-xl bg-white/5 border border-[#B9DDFF]/14 cursor-pointer">
              <div>
                <div className="text-sm font-medium text-[#F5FAFF]">نمایش تاریخ میلادی</div>
                <div className="text-xs text-[#B9DDFF]/70 mt-0.5">
                  نمایش تاریخ میلادی در کنار تاریخ شمسی در نوار بالایی
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.showGregorianDate}
                onChange={(e) => onUpdateSettings({ showGregorianDate: e.target.checked })}
                className="w-4 h-4 accent-[#38A9FF]"
              />
            </label>
          </div>

          <div className="space-y-3 pt-2 border-t border-[#B9DDFF]/15">
            <h3 className="text-xs font-semibold text-[#65D5FF]">پشتیبان‌گیری محلی (بدون فضای ابری)</h3>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-white/8 hover:bg-white/15 border border-[#B9DDFF]/20 text-[#F5FAFF] transition-colors"
              >
                <Download className="w-4 h-4 text-[#65D5FF]" />
                <span>خروجی فایل JSON</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-white/8 hover:bg-white/15 border border-[#B9DDFF]/20 text-[#F5FAFF] transition-colors"
              >
                <Upload className="w-4 h-4 text-[#65D5FF]" />
                <span>بازیابی از فایل</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={onResetDefaults}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-rose-500/15 hover:bg-rose-500/25 border border-rose-300/25 text-rose-100 transition-colors mr-auto"
              >
                <RotateCcw className="w-4 h-4" />
                <span>بازگردانی پیش‌فرض</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
