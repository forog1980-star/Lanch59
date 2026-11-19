import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Download,
  FolderSearch,
  ImagePlus,
  Info,
  Loader2,
  Mail,
  Monitor,
  Palette,
  Pencil,
  Plus,
  Power,
  RefreshCw,
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
  AppIconSource,
  AppShortcut,
  IconKey,
  LauncherSettings,
  LaunchType,
  PositionPreset,
  SystemMetrics,
} from '../../types/launcher';
import { toDisplayDigits } from '../../utils/formatters';
import {
  detectAppIdentity,
  IconLibraryMap,
  KNOWN_BRAND_ICON_OPTIONS,
  normalizeUploadedIconFile,
  resolveBrandIconKeyForShortcut,
} from '../../utils/iconLibrary';
import { AppIcon } from '../icons/AppIcon';
import { KnownBrandIcon } from '../icons/KnownAppIcons';
import { AppearanceSettingsPanel } from './AppearanceSettingsPanel';

export interface SaveShortcutPayload
  extends Omit<AppShortcut, 'id' | 'order' | 'launchCount'> {
  id?: string;
}

interface RadialManagerModalProps {
  open: boolean;
  shortcuts: AppShortcut[];
  settings: LauncherSettings;
  iconLibrary: IconLibraryMap;
  metrics: SystemMetrics;
  desktopInfo: DesktopInfo | null;
  onClose: () => void;
  onUpdateSettings: (partial: Partial<LauncherSettings>) => void;
  onSaveShortcut: (payload: SaveShortcutPayload) => void;
  onDeleteShortcut: (id: string) => void;
  onMoveShortcut: (id: string, direction: 'prev' | 'next') => void;
  onSetPositionPreset: (preset: PositionPreset) => void;
  onImportBackup: (data: {
    settings?: LauncherSettings;
    shortcuts?: AppShortcut[];
    iconLibrary?: IconLibraryMap;
  }) => void;
  onResetAppearance: () => void;
  onResetDefaults: () => void;
}

type TabKey = 'apps' | 'appearance' | 'windows' | 'about';

export const RadialManagerModal: React.FC<RadialManagerModalProps> = ({
  open,
  shortcuts,
  settings,
  iconLibrary,
  metrics,
  desktopInfo,
  onClose,
  onUpdateSettings,
  onSaveShortcut,
  onDeleteShortcut,
  onMoveShortcut,
  onSetPositionPreset,
  onImportBackup,
  onResetAppearance,
  onResetDefaults,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('apps');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const [name, setName] = useState('');
  const [englishName, setEnglishName] = useState('');
  const [launchType, setLaunchType] = useState<LaunchType>('uri');
  const [target, setTarget] = useState('');
  const [resolvedExePath, setResolvedExePath] = useState<string | undefined>(undefined);
  const [fallbackWebUrl, setFallbackWebUrl] = useState('');
  const [iconKey, setIconKey] = useState<IconKey>('layers');
  const [brandIconKey, setBrandIconKey] = useState<string | undefined>(undefined);
  const [iconSource, setIconSource] = useState<AppIconSource>('builtin');
  const [customIconDataUrl, setCustomIconDataUrl] = useState<string | undefined>(undefined);
  const [originalIconDataUrl, setOriginalIconDataUrl] = useState<string | undefined>(undefined);
  const [extractedVariants, setExtractedVariants] = useState<string[]>([]);
  const [extractingIcon, setExtractingIcon] = useState(false);
  const [iconStatusMsg, setIconStatusMsg] = useState<string | null>(null);

  const [autoStartEnabled, setAutoStartEnabled] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const customIconInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) {
      setShowEditor(false);
      setEditingId(null);
      setImportError(null);
      setIconStatusMsg(null);
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
    setResolvedExePath(undefined);
    setFallbackWebUrl('');
    setIconKey('layers');
    setBrandIconKey(undefined);
    setIconSource('builtin');
    setCustomIconDataUrl(undefined);
    setOriginalIconDataUrl(undefined);
    setExtractedVariants([]);
    setIconStatusMsg(null);
    setShowEditor(true);
  };

  const startEditApp = (item: AppShortcut) => {
    const libEntry = iconLibrary[item.id];
    const resolvedBrand =
      libEntry?.brandIconKey || item.brandIconKey || resolveBrandIconKeyForShortcut(item);
    const activeData = libEntry?.activeDataUrl || item.customIconDataUrl;
    const origData = libEntry?.originalDataUrl || item.originalIconDataUrl;
    const variants =
      libEntry?.extractedVariants ||
      item.extractedIconVariants ||
      (origData ? [origData] : []);

    setEditingId(item.id);
    setName(item.name);
    setEnglishName(item.englishName);
    setLaunchType(item.launchType);
    setTarget(item.target);
    setResolvedExePath(item.resolvedExePath);
    setFallbackWebUrl(item.fallbackWebUrl ?? '');
    setIconKey(item.iconKey);
    setBrandIconKey(resolvedBrand);
    setIconSource(
      libEntry?.source ||
        item.iconSource ||
        (activeData ? 'custom' : resolvedBrand ? 'brand' : 'builtin')
    );
    setCustomIconDataUrl(activeData);
    setOriginalIconDataUrl(origData);
    setExtractedVariants(variants);
    setIconStatusMsg(null);
    setShowEditor(true);
  };

  const runDesktopIconExtraction = async (filePath: string, allowAutoName: boolean) => {
    if (!window.launcher59Desktop || !filePath.trim()) return;
    setExtractingIcon(true);
    setIconStatusMsg('در حال شناسایی برنامه و استخراج آیکون اصلی از ویندوز...');
    try {
      const res = await window.launcher59Desktop.extractAppIcons(filePath);
      const effectivePath = res.resolvedPath || filePath;
      setResolvedExePath(effectivePath);

      const identity = detectAppIdentity(effectivePath, res.detectedName);
      if (allowAutoName || !name.trim()) {
        setName(identity.suggestedName);
        setEnglishName(identity.suggestedEnglishName);
      }
      setIconKey(identity.fallbackIconKey);
      if (identity.brandIconKey) {
        setBrandIconKey(identity.brandIconKey);
      }

      if (res.ok && Array.isArray(res.icons) && res.icons.length > 0) {
        setExtractedVariants(res.icons);
        setCustomIconDataUrl(res.icons[0]);
        setOriginalIconDataUrl(res.icons[0]);
        setIconSource('extracted');
        setIconStatusMsg(
          res.icons.length > 1
            ? `${toDisplayDigits(res.icons.length, settings.usePersianDigits)} آیکون از برنامه استخراج شد؛ می‌توانید آیکون دلخواه را انتخاب کنید.`
            : 'آیکون اصلی برنامه با موفقیت از فایل اجرایی استخراج شد.'
        );
      } else {
        setIconStatusMsg(
          identity.brandIconKey
            ? 'برنامه شناسایی شد و آیکون اختصاصی آن انتخاب گردید. در صورت نیاز می‌توانید آیکون دستی بارگذاری کنید.'
            : 'آیکون داخلی در این فایل یافت نشد؛ آیکون یکتای برنامه آماده است یا می‌توانید آیکون دستی انتخاب کنید.'
        );
      }
    } catch {
      setIconStatusMsg('استخراج خودکار آیکون ناموفق بود؛ می‌توانید آیکون دستی انتخاب کنید.');
    } finally {
      setExtractingIcon(false);
    }
  };

  const handleBrowseExe = async () => {
    if (!window.launcher59Desktop) return;
    const picked = await window.launcher59Desktop.pickExecutable();
    if (!picked) return;
    setLaunchType('bridge');
    setTarget(picked);
    const shouldAutoName = !name.trim() || !editingId;
    await runDesktopIconExtraction(picked, shouldAutoName);
  };

  const handleTargetChange = (nextTarget: string) => {
    setTarget(nextTarget);
    if (!nextTarget.trim()) return;

    const identity = detectAppIdentity(nextTarget);
    // Only auto-apply recognized identity when the user hasn't picked a custom/extracted image
    if (identity.brandIconKey && !customIconDataUrl) {
      setBrandIconKey(identity.brandIconKey);
      setIconKey(identity.fallbackIconKey);
      setIconSource('brand');
      if (!name.trim()) {
        setName(identity.suggestedName);
        setEnglishName(identity.suggestedEnglishName);
      }
    }
  };

  const handlePickCustomIcon = async () => {
    if (window.launcher59Desktop) {
      setExtractingIcon(true);
      try {
        const res = await window.launcher59Desktop.pickIconImage();
        if (res.ok && res.dataUrl) {
          setCustomIconDataUrl(res.dataUrl);
          setIconSource('custom');
          setIconStatusMsg('آیکون دستی با موفقیت انتخاب شد.');
        }
      } catch {
        setIconStatusMsg('خواندن تصویر آیکون ناموفق بود.');
      } finally {
        setExtractingIcon(false);
      }
      return;
    }

    customIconInputRef.current?.click();
  };

  const handleCustomIconFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const normalized = await normalizeUploadedIconFile(file);
      setCustomIconDataUrl(normalized);
      setIconSource('custom');
      setIconStatusMsg(`آیکون «${file.name}» با کیفیت شفاف آماده ذخیره است.`);
    } catch (err) {
      setIconStatusMsg(err instanceof Error ? err.message : 'خواندن فایل آیکون ناموفق بود.');
    }
  };

  const handleRestoreOriginalIcon = () => {
    if (!originalIconDataUrl) return;
    setCustomIconDataUrl(originalIconDataUrl);
    setIconSource('extracted');
    setIconStatusMsg('آیکون اصلی استخراج‌شده از برنامه بازگردانی شد.');
  };

  const handleSelectBrandIcon = (brandKey: string) => {
    setBrandIconKey(brandKey);
    setCustomIconDataUrl(undefined);
    setIconSource('brand');
    setIconStatusMsg(null);
  };

  const handleSelectBuiltinIcon = (key: IconKey) => {
    setIconKey(key);
    setBrandIconKey(undefined);
    setCustomIconDataUrl(undefined);
    setIconSource('builtin');
    setIconStatusMsg(null);
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
      brandIconKey,
      iconSource,
      customIconDataUrl,
      originalIconDataUrl,
      extractedIconVariants: extractedVariants.length > 0 ? extractedVariants : undefined,
      resolvedExePath,
      size: existing?.size || 'standard',
      pinnedToDock: existing?.pinnedToDock ?? true,
    });
    setShowEditor(false);
    setEditingId(null);
    setIconStatusMsg(null);
  };

  const handleExportBackup = () => {
    const payload = {
      app: 'LAUNCHER 59 Radial',
      version: 3,
      appVersion: APP_METADATA.version,
      exportedAt: new Date().toISOString(),
      settings,
      shortcuts,
      iconLibrary,
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
        onImportBackup({
          settings: parsed.settings,
          shortcuts: parsed.shortcuts,
          iconLibrary:
            parsed.iconLibrary && typeof parsed.iconLibrary === 'object'
              ? parsed.iconLibrary
              : undefined,
        });
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
  const canRestoreOriginal =
    Boolean(originalIconDataUrl) && customIconDataUrl !== originalIconDataUrl;

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
        className="acrylic-modal w-full max-w-[590px] max-h-[86vh] rounded-3xl flex flex-col overflow-hidden text-[#F5FAFF]"
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
              <p className="text-[11px] text-[#B9DDFF]/75">
                نرم‌افزارها، آیکون‌های اختصاصی، ظاهر شیشه‌ای و تنظیمات ویندوز
              </p>
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
            <span>ظاهر و شخصی‌سازی</span>
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
                  ۸ برنامه اول در صفحه نخست حلقه نمایش داده می‌شوند و هر برنامه آیکون مستقل خود را دارد.
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
                  className="p-4 rounded-2xl bg-[#071D3A]/90 border border-[#65D5FF]/30 space-y-3.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#65D5FF]">
                      {editingId ? 'ویرایش نرم‌افزار و آیکون' : 'افزودن نرم‌افزار جدید'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditor(false);
                        setEditingId(null);
                        setIconStatusMsg(null);
                      }}
                      className="text-[11px] text-[#B9DDFF] hover:text-[#F5FAFF] cursor-pointer"
                    >
                      انصراف
                    </button>
                  </div>

                  {/* Executable / Path Picker */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                      <label className="text-[11px] text-[#B9DDFF]">مسیر فایل اجرایی، میانبر یا نشانی</label>
                      <div className="flex items-center gap-1.5">
                        {desktopInfo && (
                          <button
                            type="button"
                            onClick={handleBrowseExe}
                            disabled={extractingIcon}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0078D4]/55 hover:bg-[#0078D4]/80 border border-[#65D5FF]/40 text-[11px] text-[#F5FAFF] cursor-pointer disabled:opacity-50"
                          >
                            {extractingIcon ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <FolderSearch className="w-3 h-3" />
                            )}
                            <span>انتخاب فایل exe / lnk</span>
                          </button>
                        )}
                        {desktopInfo && launchType === 'bridge' && target.trim() && (
                          <button
                            type="button"
                            onClick={() => runDesktopIconExtraction(target.trim(), false)}
                            disabled={extractingIcon}
                            title="استخراج مجدد آیکون واقعی از مسیر فعلی"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/8 hover:bg-white/15 border border-white/15 text-[11px] text-[#B9DDFF] cursor-pointer disabled:opacity-50"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>استخراج آیکون</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <input
                      type="text"
                      required
                      dir="ltr"
                      value={target}
                      onChange={(e) => handleTargetChange(e.target.value)}
                      placeholder={
                        launchType === 'bridge'
                          ? 'C:\\Program Files\\...\\WINWORD.EXE یا فایل .lnk'
                          : launchType === 'uri'
                            ? 'vscode:// یا ms-settings:'
                            : 'https://...'
                      }
                      className="w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 text-xs font-mono-tabular text-[#F5FAFF] focus:outline-none focus:border-[#65D5FF]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] text-[#B9DDFF] mb-1">نام نمایشی</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="مثلاً مایکروسافت ورد، اکسل یا کروم"
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
                        <option value="bridge">فایل اجرایی / میانبر ویندوز (EXE / LNK)</option>
                        <option value="uri">پروتکل سیستم (URI)</option>
                        <option value="web">نشانی وب (URL)</option>
                      </select>
                    </div>
                  </div>

                  {/* Independent Icon Studio & Auto-Extracted Multi-Icon Picker */}
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-11 h-11 rounded-2xl bg-[#0078D4]/25 border border-[#65D5FF]/40 flex items-center justify-center shrink-0">
                          <AppIcon
                            iconKey={iconKey}
                            brandIconKey={brandIconKey}
                            customIconDataUrl={customIconDataUrl}
                            appName={name || englishName || target}
                            className="w-7 h-7"
                          />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-[#F5FAFF]">آیکون اختصاصی برنامه</div>
                          <div className="text-[10px] text-[#B9DDFF]/75">
                            {iconSource === 'extracted'
                              ? 'استخراج‌شده از فایل اجرایی ویندوز'
                              : iconSource === 'custom'
                                ? 'تصویر دستی انتخاب‌شده توسط کاربر'
                                : iconSource === 'brand'
                                  ? 'آیکون استاندارد شناسایی‌شده برنامه'
                                  : 'آیکون برداری انتخابی'}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handlePickCustomIcon}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/18 border border-white/15 text-[11px] text-[#F5FAFF] cursor-pointer"
                        >
                          <ImagePlus className="w-3.5 h-3.5 text-[#65D5FF]" />
                          <span>انتخاب آیکون دستی</span>
                        </button>
                        <input
                          ref={customIconInputRef}
                          type="file"
                          accept=".png,.ico,.svg,.webp,.jpg,.jpeg,image/*"
                          onChange={handleCustomIconFileChange}
                          className="hidden"
                        />
                        {canRestoreOriginal && (
                          <button
                            type="button"
                            onClick={handleRestoreOriginalIcon}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0078D4]/30 hover:bg-[#0078D4]/50 border border-[#65D5FF]/40 text-[11px] text-[#F5FAFF] cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>بازگردانی آیکون اصلی</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {iconStatusMsg && (
                      <div className="text-[11px] text-[#7CE6FF] bg-[#0078D4]/15 border border-[#65D5FF]/25 rounded-lg px-2.5 py-1.5">
                        {iconStatusMsg}
                      </div>
                    )}

                    {/* Multi-Icon Picker when EXE/DLL contains multiple icons */}
                    {extractedVariants.length > 0 && (
                      <div>
                        <div className="text-[10px] text-[#B9DDFF]/80 mb-1.5">
                          آیکون‌های استخراج‌شده از فایل ({toDisplayDigits(extractedVariants.length, settings.usePersianDigits)} مورد):
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {extractedVariants.map((variantUrl, vIdx) => {
                            const selected = customIconDataUrl === variantUrl;
                            return (
                              <button
                                key={`${vIdx}-${variantUrl.slice(-18)}`}
                                type="button"
                                onClick={() => {
                                  setCustomIconDataUrl(variantUrl);
                                  setIconSource('extracted');
                                }}
                                title={`آیکون استخراج‌شده ${vIdx + 1}`}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center border cursor-pointer transition-colors ${
                                  selected
                                    ? 'bg-[#0078D4]/45 border-[#65D5FF]'
                                    : 'bg-white/5 border-white/10 hover:bg-white/12'
                                }`}
                              >
                                <img
                                  src={variantUrl}
                                  alt={`Extracted icon ${vIdx + 1}`}
                                  className="w-7 h-7 object-contain"
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Known Windows App Brand Icons */}
                    <div>
                      <div className="text-[10px] text-[#B9DDFF]/80 mb-1.5">
                        آیکون‌های شناخته‌شده ویندوز و آفیس:
                      </div>
                      <div className="grid grid-cols-6 sm:grid-cols-9 gap-1.5">
                        {KNOWN_BRAND_ICON_OPTIONS.map((opt) => {
                          const selected = !customIconDataUrl && brandIconKey === opt.key;
                          return (
                            <button
                              key={opt.key}
                              type="button"
                              title={opt.label}
                              onClick={() => handleSelectBrandIcon(opt.key)}
                              className={`h-9 rounded-lg flex items-center justify-center border cursor-pointer transition-colors ${
                                selected
                                  ? 'bg-[#0078D4]/45 border-[#65D5FF]'
                                  : 'bg-white/5 border-white/10 hover:bg-white/12'
                              }`}
                            >
                              <KnownBrandIcon brandKey={opt.key} className="w-5 h-5" />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Built-in Vector Icons */}
                    <div>
                      <div className="text-[10px] text-[#B9DDFF]/80 mb-1.5">آیکون‌های برداری عمومی:</div>
                      <div className="grid grid-cols-8 gap-1.5">
                        {ICON_OPTIONS.map((opt) => {
                          const selected = !customIconDataUrl && !brandIconKey && iconKey === opt.key;
                          return (
                            <button
                              key={opt.key}
                              type="button"
                              title={opt.label}
                              onClick={() => handleSelectBuiltinIcon(opt.key)}
                              className={`h-8 rounded-lg flex items-center justify-center border cursor-pointer transition-colors ${
                                selected
                                  ? 'bg-[#0078D4]/45 border-[#65D5FF] text-[#F5FAFF]'
                                  : 'bg-white/5 border-white/10 text-[#B9DDFF] hover:bg-white/10'
                              }`}
                            >
                              <AppIcon iconKey={opt.key} className="w-4 h-4" />
                            </button>
                          );
                        })}
                      </div>
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
                {shortcuts.map((item, idx) => {
                  const libEntry = iconLibrary[item.id];
                  const resolvedCustom = libEntry?.activeDataUrl || item.customIconDataUrl;
                  const resolvedBrand =
                    libEntry?.brandIconKey || item.brandIconKey || resolveBrandIconKeyForShortcut(item);

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2 px-3 py-2 rounded-2xl bg-white/5 border border-white/10 hover:border-[#65D5FF]/35"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-[#0078D4]/22 border border-[#B9DDFF]/25 flex items-center justify-center text-[#65D5FF] shrink-0">
                          <AppIcon
                            iconKey={item.iconKey}
                            brandIconKey={resolvedBrand}
                            customIconDataUrl={resolvedCustom}
                            appName={item.englishName || item.name}
                            className="w-5 h-5"
                          />
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
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <AppearanceSettingsPanel
              settings={settings}
              onUpdateSettings={onUpdateSettings}
              onSetPositionPreset={onSetPositionPreset}
              onResetAppearance={onResetAppearance}
            />
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
                      نسخه مستقل دسکتاپ:{' '}
                      <span dir="ltr" className="font-mono-tabular">
                        v{desktopInfo.appVersion}
                      </span>
                    </div>
                    <div dir="ltr" className="font-mono-tabular truncate text-[10px] opacity-80">
                      {desktopInfo.userDataPath}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-3.5 py-3 rounded-2xl bg-[#0078D4]/15 border border-[#65D5FF]/30 text-xs text-[#B9DDFF] leading-relaxed">
                  در حالت پیش‌نمایش وب قرار دارید. در نسخه نصبی ویندوز (`.exe`)، پنجره کاملاً شفاف و بدون حاشیه روی دسکتاپ شناور می‌شود، آیکون واقعی هر فایل exe و میانبر lnk به‌طور خودکار استخراج می‌گردد و از System Tray پشتیبانی می‌کند.
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
                  <span>بازگردانی کامل</span>
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
