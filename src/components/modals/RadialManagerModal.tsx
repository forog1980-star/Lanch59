import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Download,
  FolderSearch,
  Info,
  Mail,
  Monitor,
  Palette,
  Pencil,
  Plus,
  Power,
  RotateCcw,
  Save,
  Sliders,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { APP_METADATA } from '../../data/appMetadata';
import { ICON_OPTIONS } from '../../data/defaultShortcuts';
import { DesktopInfo } from '../../types/desktop';
import {
  AppShortcut,
  GlowTheme,
  IconKey,
  LauncherSettings,
  LaunchType,
  PositionPreset,
  RingSize,
  SystemMetrics,
} from '../../types/launcher';
import { toDisplayDigits } from '../../utils/formatters';
import { AppIcon } from '../icons/AppIcon';

interface RadialManagerModalProps {
  open: boolean;
  shortcuts: AppShortcut[];
  settings: LauncherSettings;
  metrics: SystemMetrics;
  desktopInfo: DesktopInfo | null;
  onClose: () => void;
  onUpdateSettings: (partial: Partial<LauncherSettings>) => void;
  onSaveShortcut: (
    payload: Omit<AppShortcut, 'id' | 'order' | 'launchCount'> & { id?: string }
  ) => void;
  onDeleteShortcut: (id: string) => void;
  onMoveShortcut: (id: string, direction: 'prev' | 'next') => void;
  onSetPositionPreset: (preset: PositionPreset) => void;
  onImportBackup: (data: { settings?: LauncherSettings; shortcuts?: AppShortcut[] }) => void;
  onResetDefaults: () => void;
}

type TabKey = 'apps' | 'appearance' | 'windows' | 'about';

export const RadialManagerModal: React.FC<RadialManagerModalProps> = ({
  open,
  shortcuts,
  settings,
  metrics,
  desktopInfo,
  onClose,
  onUpdateSettings,
  onSaveShortcut,
  onDeleteShortcut,
  onMoveShortcut,
  onSetPositionPreset,
  onImportBackup,
  onResetDefaults,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('apps');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const [name, setName] = useState('');
  const [englishName, setEnglishName] = useState('');
  const [launchType, setLaunchType] = useState<LaunchType>('uri');
  const [target, setTarget] = useState('');
  const [fallbackWebUrl, setFallbackWebUrl] = useState('');
  const [iconKey, setIconKey] = useState<IconKey>('layers');

  const [autoStartEnabled, setAutoStartEnabled] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) {
      setShowEditor(false);
      setEditingId(null);
      setImportError(null);
      return;
    }
    if (window.launcher59Desktop) {
      window.launcher59Desktop
        .getAutoStart()
        .then(setAutoStartEnabled)
        .catch(() => {});
    }
  }, [open]);

  if (!open) return null;

  const startNewApp = () => {
    setEditingId(null);
    setName('');
    setEnglishName('');
    setLaunchType(desktopInfo ? 'bridge' : 'uri');
    setTarget('');
    setFallbackWebUrl('');
    setIconKey('layers');
    setShowEditor(true);
  };

  const startEditApp = (item: AppShortcut) => {
    setEditingId(item.id);
    setName(item.name);
    setEnglishName(item.englishName);
    setLaunchType(item.launchType);
    setTarget(item.target);
    setFallbackWebUrl(item.fallbackWebUrl ?? '');
    setIconKey(item.iconKey);
    setShowEditor(true);
  };

  const handleBrowseExe = async () => {
    if (!window.launcher59Desktop) return;
    const picked = await window.launcher59Desktop.pickExecutable();
    if (picked) {
      setLaunchType('bridge');
      setTarget(picked);
      if (!name.trim()) {
        const base = picked.split(/[/\\]/).pop()?.replace(/\.[^.]+$/, '') ?? '';
        setName(base);
        setEnglishName(base);
      }
    }
  };

  const handleSubmitApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !target.trim()) return;
    const existing = editingId ? shortcuts.find((s) => s.id === editingId) : undefined;
    onSaveShortcut({
      id: editingId ?? undefined,
      name: name.trim(),
      englishName: englishName.trim() || name.trim(),
      description: existing?.description || 'نرم‌افزار منتخب لانچر ۵۹',
      category: existing?.category || 'system',
      launchType,
      target: target.trim(),
      fallbackWebUrl: fallbackWebUrl.trim() || undefined,
      bridgeCommand: launchType === 'bridge' ? target.trim() : existing?.bridgeCommand,
      iconKey,
      size: existing?.size || 'standard',
      pinnedToDock: existing?.pinnedToDock ?? true,
    });
    setShowEditor(false);
    setEditingId(null);
  };

  const handleExportBackup = () => {
    const payload = {
      app: 'LAUNCHER 59 Radial',
      version: 2,
      exportedAt: new Date().toISOString(),
      settings,
      shortcuts,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `launcher59-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed || (!Array.isArray(parsed.shortcuts) && !parsed.settings)) {
          setImportError('ساختار فایل پشتیبان معتبر نیست.');
          return;
        }
        onImportBackup({ settings: parsed.settings, shortcuts: parsed.shortcuts });
        setImportError(null);
      } catch {
        setImportError('خواندن فایل JSON با خطا مواجه شد.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const toggleAlwaysOnTop = async (nextVal: boolean) => {
    onUpdateSettings({ alwaysOnTop: nextVal });
    if (window.launcher59Desktop) {
      await window.launcher59Desktop.setAlwaysOnTop(nextVal).catch(() => {});
    }
  };

  const toggleMinimizeToTray = async (nextVal: boolean) => {
    onUpdateSettings({ minimizeToTray: nextVal });
    if (window.launcher59Desktop) {
      await window.launcher59Desktop.setMinimizeToTray(nextVal).catch(() => {});
    }
  };

  const toggleAutoStart = async (nextVal: boolean) => {
    if (!window.launcher59Desktop) return;
    const confirmed = await window.launcher59Desktop.setAutoStart(nextVal).catch(() => false);
    setAutoStartEnabled(confirmed);
  };

  const bridgeStats = metrics.bridgeStats;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-[#020B1A]/60 backdrop-blur-sm"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="تنظیمات و مدیریت LAUNCHER 59"
    >
      <div
        className="acrylic-modal w-full max-w-[520px] max-h-[84vh] rounded-3xl flex flex-col overflow-hidden text-[#F5FAFF]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#B9DDFF]/15 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#0078D4]/30 border border-[#65D5FF]/45 flex items-center justify-center font-display font-bold text-sm text-[#65D5FF]">
              59
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#F5FAFF]">مدیریت LAUNCHER 59</h2>
              <p className="text-[11px] text-[#B9DDFF]/75">نرم‌افزارها، ظاهر حلقه و تنظیمات ویندوز</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن تنظیمات"
            className="p-1.5 rounded-full hover:bg-white/10 text-[#B9DDFF] hover:text-[#F5FAFF] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Compact Navigation Tabs */}
        <div className="px-5 pt-3 flex flex-wrap items-center gap-1.5 border-b border-[#B9DDFF]/10 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('apps')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
              activeTab === 'apps'
                ? 'bg-[#0078D4] text-[#F5FAFF]'
                : 'bg-white/5 text-[#B9DDFF] hover:bg-white/10'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>نرم‌افزارها ({toDisplayDigits(shortcuts.length, settings.usePersianDigits)})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
              activeTab === 'appearance'
                ? 'bg-[#0078D4] text-[#F5FAFF]'
                : 'bg-white/5 text-[#B9DDFF] hover:bg-white/10'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>ظاهر و موقعیت</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('windows')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
              activeTab === 'windows'
                ? 'bg-[#0078D4] text-[#F5FAFF]'
                : 'bg-white/5 text-[#B9DDFF] hover:bg-white/10'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>ویندوز و سیستم</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
              activeTab === 'about'
                ? 'bg-[#0078D4] text-[#F5FAFF]'
                : 'bg-white/5 text-[#B9DDFF] hover:bg-white/10'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>درباره برنامه</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'apps' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] text-[#B9DDFF]/80">
                  ۸ برنامه اول در صفحه نخست حلقه نمایش داده می‌شوند و بقیه در صفحات بعدی حلقه قرار دارند.
                </p>
                {!showEditor && (
                  <button
                    type="button"
                    onClick={startNewApp}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0078D4] hover:bg-[#198AE0] text-xs font-medium text-[#F5FAFF] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>افزودن</span>
                  </button>
                )}
              </div>

              {showEditor && (
                <form
                  onSubmit={handleSubmitApp}
                  className="p-3.5 rounded-2xl bg-[#071D3A]/85 border border-[#65D5FF]/30 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#65D5FF]">
                      {editingId ? 'ویرایش نرم‌افزار' : 'افزودن نرم‌افزار جدید'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditor(false);
                        setEditingId(null);
                      }}
                      className="text-[11px] text-[#B9DDFF] hover:text-[#F5FAFF] cursor-pointer"
                    >
                      انصراف
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] text-[#B9DDFF] mb-1">نام نمایشی (فارسی)</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="مثلاً فتوشاپ یا ترمینال"
                        className="w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 text-xs text-[#F5FAFF] focus:outline-none focus:border-[#65D5FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#B9DDFF] mb-1">نوع اجرا</label>
                      <select
                        value={launchType}
                        onChange={(e) => setLaunchType(e.target.value as LaunchType)}
                        className="w-full px-3 py-1.5 rounded-xl bg-[#0B2549] border border-white/15 text-xs text-[#F5FAFF] focus:outline-none focus:border-[#65D5FF]"
                      >
                        <option value="bridge">فایل اجرایی ویندوز (EXE)</option>
                        <option value="uri">پروتکل سیستم (URI)</option>
                        <option value="web">نشانی وب (URL)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] text-[#B9DDFF]">مسیر فایل یا نشانی</label>
                      {desktopInfo && (
                        <button
                          type="button"
                          onClick={handleBrowseExe}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#0078D4]/40 hover:bg-[#0078D4]/65 border border-[#65D5FF]/35 text-[11px] text-[#F5FAFF] cursor-pointer"
                        >
                          <FolderSearch className="w-3 h-3" />
                          <span>انتخاب فایل exe</span>
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      dir="ltr"
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      placeholder={
                        launchType === 'bridge'
                          ? 'C:\\Program Files\\...\\app.exe'
                          : launchType === 'uri'
                            ? 'vscode:// یا ms-settings:'
                            : 'https://...'
                      }
                      className="w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 text-xs font-mono-tabular text-[#F5FAFF] focus:outline-none focus:border-[#65D5FF]"
                    />
                  </div>

                  <div>
                    <span className="block text-[11px] text-[#B9DDFF] mb-1.5">انتخاب آیکون</span>
                    <div className="grid grid-cols-8 gap-1.5">
                      {ICON_OPTIONS.map((opt) => (
                        <button
                          key={opt.key}
                          type="button"
                          title={opt.label}
                          onClick={() => setIconKey(opt.key)}
                          className={`h-8 rounded-lg flex items-center justify-center border cursor-pointer transition-colors ${
                            iconKey === opt.key
                              ? 'bg-[#0078D4]/45 border-[#65D5FF] text-[#F5FAFF]'
                              : 'bg-white/5 border-white/10 text-[#B9DDFF] hover:bg-white/10'
                          }`}
                        >
                          <AppIcon iconKey={opt.key} className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#0078D4] hover:bg-[#198AE0] text-xs font-medium text-[#F5FAFF] cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>ذخیره</span>
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-1.5">
                {shortcuts.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-2xl bg-white/5 border border-white/10 hover:border-[#65D5FF]/35"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#0078D4]/25 border border-[#B9DDFF]/25 flex items-center justify-center text-[#65D5FF] shrink-0">
                        <AppIcon iconKey={item.iconKey} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-[#F5FAFF] truncate">
                          {item.name}
                        </div>
                        <div
                          dir="ltr"
                          className="text-[10px] font-mono-tabular text-[#B9DDFF]/65 truncate"
                        >
                          {item.target}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => onMoveShortcut(item.id, 'prev')}
                        aria-label="جابه‌جایی به بالا"
                        className="p-1.5 rounded-lg hover:bg-white/10 text-[#B9DDFF] disabled:opacity-25 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === shortcuts.length - 1}
                        onClick={() => onMoveShortcut(item.id, 'next')}
                        aria-label="جابه‌جایی به پایین"
                        className="p-1.5 rounded-lg hover:bg-white/10 text-[#B9DDFF] disabled:opacity-25 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => startEditApp(item)}
                        aria-label="ویرایش"
                        className="p-1.5 rounded-lg hover:bg-white/10 text-[#B9DDFF] hover:text-[#65D5FF] cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteShortcut(item.id)}
                        aria-label="حذف"
                        className="p-1.5 rounded-lg hover:bg-rose-500/20 text-[#B9DDFF] hover:text-rose-300 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div>
                <div className="text-xs font-medium text-[#F5FAFF] mb-2">اندازه حلقه برنامه‌ها</div>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { key: 'small', label: 'کوچک' },
                      { key: 'medium', label: 'متوسط' },
                      { key: 'large', label: 'بزرگ' },
                    ] as { key: RingSize; label: string }[]
                  ).map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => onUpdateSettings({ ringSize: opt.key })}
                      className={`py-2 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                        settings.ringSize === opt.key
                          ? 'bg-[#0078D4]/45 border-[#65D5FF] text-[#F5FAFF]'
                          : 'bg-white/5 border-white/10 text-[#B9DDFF] hover:bg-white/10'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-[#F5FAFF] mb-2">رنگ هاله نور</div>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { key: 'azure', label: 'آبی ویندوز', dot: '#38A9FF' },
                      { key: 'cyan', label: 'فیروزه‌ای', dot: '#22D3EE' },
                      { key: 'indigo', label: 'نیلی ملایم', dot: '#818CF8' },
                    ] as { key: GlowTheme; label: string; dot: string }[]
                  ).map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => onUpdateSettings({ glowTheme: opt.key })}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                        settings.glowTheme === opt.key
                          ? 'bg-[#0078D4]/45 border-[#65D5FF] text-[#F5FAFF]'
                          : 'bg-white/5 border-white/10 text-[#B9DDFF] hover:bg-white/10'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: opt.dot }}
                      />
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-[#F5FAFF] mb-2">شدت درخشش هاله</div>
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
                      className={`py-2 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                        settings.haloIntensity === opt.key
                          ? 'bg-[#0078D4]/45 border-[#65D5FF] text-[#F5FAFF]'
                          : 'bg-white/5 border-white/10 text-[#B9DDFF] hover:bg-white/10'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-medium text-[#F5FAFF]">
                    موقعیت سریع ۹گانه (یا جابه‌جایی آزاد با Drag)
                  </span>
                  <button
                    type="button"
                    onClick={() => onSetPositionPreset('center')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-[#65D5FF] cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>بازگردانی به مرکز</span>
                  </button>
                </div>
                <div dir="ltr" className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { key: 'top-left', label: 'بالا چپ' },
                      { key: 'top', label: 'بالا' },
                      { key: 'top-right', label: 'بالا راست' },
                      { key: 'left', label: 'چپ' },
                      { key: 'center', label: 'مرکز' },
                      { key: 'right', label: 'راست' },
                      { key: 'bottom-left', label: 'پایین چپ' },
                      { key: 'bottom-center', label: 'پایین' },
                      { key: 'bottom-right', label: 'پایین راست' },
                    ] as { key: PositionPreset; label: string }[]
                  ).map((preset) => (
                    <button
                      key={preset.key}
                      type="button"
                      dir="rtl"
                      onClick={() => onSetPositionPreset(preset.key)}
                      className={`py-2 px-2 rounded-xl border text-[11px] font-medium cursor-pointer transition-colors ${
                        settings.positionPreset === preset.key
                          ? 'bg-[#0078D4]/45 border-[#65D5FF] text-[#F5FAFF]'
                          : 'bg-white/5 border-white/10 text-[#B9DDFF] hover:bg-white/10'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                {settings.positionPreset === 'custom' && (
                  <p className="mt-1.5 text-[11px] text-[#B9DDFF]/75">
                    موقعیت فعلی به‌صورت دستی تنظیم شده و با باز شدن حلقه به‌طور خودکار در محدوده صفحه حفظ می‌شود.
                  </p>
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="text-xs font-medium text-[#F5FAFF]">
                      کاهش شفافیت خودکار در بیکاری (Auto-Fade)
                    </div>
                    <div className="text-[11px] text-[#B9DDFF]/70">
                      هنگام عدم استفاده محو و آرام می‌شود و با اشاره ماوس بلافاصله کامل ظاهر می‌گردد
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoFadeEnabled}
                    onChange={(e) => onUpdateSettings({ autoFadeEnabled: e.target.checked })}
                    className="accent-[#38A9FF] w-4 h-4 cursor-pointer shrink-0 mr-2"
                  />
                </label>

                {settings.autoFadeEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-[#B9DDFF] mb-1">
                        <span>شفافیت در بیکاری</span>
                        <span className="font-mono-tabular text-[#65D5FF]">
                          {toDisplayDigits(
                            Math.round(settings.idleOpacity * 100),
                            settings.usePersianDigits
                          )}
                          %
                        </span>
                      </div>
                      <input
                        type="range"
                        min={15}
                        max={85}
                        step={5}
                        value={Math.round(settings.idleOpacity * 100)}
                        onChange={(e) =>
                          onUpdateSettings({ idleOpacity: Number(e.target.value) / 100 })
                        }
                        className="w-full accent-[#38A9FF] cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-[#B9DDFF] mb-1">
                        <span>زمان انتظار</span>
                        <span className="font-mono-tabular text-[#65D5FF]">
                          {toDisplayDigits(settings.idleDelaySeconds, settings.usePersianDigits)} ثانیه
                        </span>
                      </div>
                      <input
                        type="range"
                        min={2}
                        max={30}
                        step={1}
                        value={settings.idleDelaySeconds}
                        onChange={(e) =>
                          onUpdateSettings({ idleDelaySeconds: Number(e.target.value) })
                        }
                        className="w-full accent-[#38A9FF] cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>

              <label className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/10 cursor-pointer">
                <span className="text-xs text-[#F5FAFF]">کاهش انیمیشن‌ها (Reduce Motion)</span>
                <input
                  type="checkbox"
                  checked={settings.reduceMotion}
                  onChange={(e) => onUpdateSettings({ reduceMotion: e.target.checked })}
                  className="accent-[#38A9FF] w-4 h-4 cursor-pointer"
                />
              </label>
            </div>
          )}

          {activeTab === 'windows' && (
            <div className="space-y-4">
              {desktopInfo ? (
                <div className="space-y-2.5">
                  <div className="text-xs font-semibold text-[#65D5FF]">رفتار پنجره شناور ویندوز</div>
                  <label className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/10 cursor-pointer">
                    <span className="text-xs text-[#F5FAFF]">همیشه روی سایر پنجره‌ها (Always on Top)</span>
                    <input
                      type="checkbox"
                      checked={settings.alwaysOnTop}
                      onChange={(e) => toggleAlwaysOnTop(e.target.checked)}
                      className="accent-[#38A9FF] w-4 h-4 cursor-pointer"
                    />
                  </label>
                  <label className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/10 cursor-pointer">
                    <span className="text-xs text-[#F5FAFF]">شروع خودکار با ورود به ویندوز</span>
                    <input
                      type="checkbox"
                      checked={autoStartEnabled}
                      onChange={(e) => toggleAutoStart(e.target.checked)}
                      className="accent-[#38A9FF] w-4 h-4 cursor-pointer"
                    />
                  </label>
                  <label className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/10 cursor-pointer">
                    <span className="text-xs text-[#F5FAFF]">نگهداری در System Tray هنگام بستن پنجره</span>
                    <input
                      type="checkbox"
                      checked={settings.minimizeToTray}
                      onChange={(e) => toggleMinimizeToTray(e.target.checked)}
                      className="accent-[#38A9FF] w-4 h-4 cursor-pointer"
                    />
                  </label>
                  <div className="px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-[#B9DDFF]/80 space-y-1">
                    <div>
                      نسخه مستقل دسکتاپ: <span dir="ltr" className="font-mono-tabular">v{desktopInfo.appVersion}</span>
                    </div>
                    <div dir="ltr" className="font-mono-tabular truncate text-[10px] opacity-80">
                      {desktopInfo.userDataPath}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-3.5 py-3 rounded-2xl bg-[#0078D4]/15 border border-[#65D5FF]/30 text-xs text-[#B9DDFF] leading-relaxed">
                  در حالت پیش‌نمایش وب قرار دارید. در نسخه نصبی ویندوز (`.exe`)، پنجره کاملاً شفاف و بدون حاشیه روی دسکتاپ شناور می‌شود و از System Tray و اجرای مستقیم فایل‌های exe پشتیبانی می‌کند.
                </div>
              )}

              {/* Compact Real System Telemetry Inside Submenu Only */}
              <div className="px-3.5 py-3 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="text-xs font-semibold text-[#B9DDFF]">وضعیت واقعی سیستم</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]" dir="ltr">
                  <div className="p-2 rounded-xl bg-black/20">
                    <div className="text-[#B9DDFF]/65 text-[10px]">CPU</div>
                    <div className="font-mono-tabular font-semibold text-[#F5FAFF]">
                      {bridgeStats ? `${bridgeStats.cpuUsagePercent}%` : `${metrics.cpuCores ?? '--'} Cores`}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-black/20">
                    <div className="text-[#B9DDFF]/65 text-[10px]">RAM</div>
                    <div className="font-mono-tabular font-semibold text-[#F5FAFF]">
                      {bridgeStats
                        ? `${bridgeStats.usedMemoryGb}/${bridgeStats.totalMemoryGb} GB`
                        : metrics.deviceMemoryGb
                          ? `${metrics.deviceMemoryGb} GB`
                          : '--'}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-black/20">
                    <div className="text-[#B9DDFF]/65 text-[10px]">DISK {bridgeStats?.diskDrive || 'C:'}</div>
                    <div className="font-mono-tabular font-semibold text-[#F5FAFF]">
                      {bridgeStats ? `${bridgeStats.diskFreeGb} GB free` : '--'}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-black/20">
                    <div className="text-[#B9DDFF]/65 text-[10px]">LAUNCHER</div>
                    <div className="font-mono-tabular font-semibold text-[#65D5FF]">
                      {desktopInfo ? `${desktopInfo.memoryRssMb} MB` : metrics.online ? 'Online' : 'Offline'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Backup / Restore / Reset */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-[#F5FAFF] cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#65D5FF]" />
                  <span>خروجی پشتیبان</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-[#F5FAFF] cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#65D5FF]" />
                  <span>بازیابی پشتیبان</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json"
                  onChange={handleImportFile}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={onResetDefaults}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/15 text-xs text-[#B9DDFF] hover:text-rose-200 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>بازگردانی پیش‌فرض</span>
                </button>
                {desktopInfo && (
                  <button
                    type="button"
                    onClick={() => window.launcher59Desktop?.windowAction('quit')}
                    className="mr-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/35 border border-rose-400/35 text-xs text-rose-100 cursor-pointer"
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>خروج کامل</span>
                  </button>
                )}
              </div>
              {importError && <p className="text-xs text-rose-300">{importError}</p>}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-[#65D5FF]/25 flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-[#0078D4]/30 border border-[#65D5FF]/50 flex items-center justify-center font-display font-bold text-xl text-[#65D5FF] shrink-0">
                  59
                </div>
                <div>
                  <div className="text-sm font-bold text-[#F5FAFF]">{APP_METADATA.productName}</div>
                  <div className="text-xs text-[#B9DDFF]/80">
                    لانچر دایره‌ای شناور و هوشمند دسکتاپ ویندوز
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/10 divide-y divide-white/10 text-xs">
                <div className="px-4 py-2.5 flex items-center justify-between gap-2">
                  <span className="text-[#B9DDFF]/75">نام محصول</span>
                  <span dir="ltr" className="font-semibold text-[#F5FAFF]">
                    {APP_METADATA.productName}
                  </span>
                </div>
                <div className="px-4 py-2.5 flex items-center justify-between gap-2">
                  <span className="text-[#B9DDFF]/75">نسخه برنامه</span>
                  <span dir="ltr" className="font-mono-tabular font-semibold text-[#65D5FF]">
                    v{desktopInfo?.appVersion ?? APP_METADATA.version}
                  </span>
                </div>
                <div className="px-4 py-2.5 flex items-center justify-between gap-2">
                  <span className="text-[#B9DDFF]/75">سازنده / ناشر</span>
                  <span className="font-medium text-[#F5FAFF]">
                    {APP_METADATA.manufacturerName}
                  </span>
                </div>
                <div className="px-4 py-2.5 flex items-center justify-between gap-2">
                  <span className="text-[#B9DDFF]/75">ایمیل تماس</span>
                  <a
                    href={`mailto:${APP_METADATA.contactEmail}`}
                    dir="ltr"
                    className="inline-flex items-center gap-1.5 font-mono-tabular text-[#65D5FF] hover:underline"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{APP_METADATA.contactEmail}</span>
                  </a>
                </div>
                <div className="px-4 py-2.5 flex items-center justify-between gap-2">
                  <span className="text-[#B9DDFF]/75">سال انتشار</span>
                  <span dir="ltr" className="font-mono-tabular text-[#F5FAFF]">
                    {APP_METADATA.buildYear}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
