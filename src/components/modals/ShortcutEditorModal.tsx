import React, { useEffect, useState } from 'react';
import { FolderSearch, Plus, Save, X } from 'lucide-react';
import { CATEGORY_LABELS, ICON_OPTIONS } from '../../data/defaultShortcuts';
import { AppCategory, AppShortcut, CardSize, IconKey, LaunchType } from '../../types/launcher';
import { AppIcon } from '../icons/AppIcon';

interface ShortcutEditorModalProps {
  open: boolean;
  editingShortcut: AppShortcut | null;
  onClose: () => void;
  onSave: (shortcut: Omit<AppShortcut, 'id' | 'order' | 'launchCount'> & { id?: string }) => void;
}

const CATEGORIES: AppCategory[] = [
  'development',
  'productivity',
  'design',
  'system',
  'media',
  'web',
];

export const ShortcutEditorModal: React.FC<ShortcutEditorModalProps> = ({
  open,
  editingShortcut,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [englishName, setEnglishName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<AppCategory>('productivity');
  const [launchType, setLaunchType] = useState<LaunchType>('uri');
  const [target, setTarget] = useState('');
  const [fallbackWebUrl, setFallbackWebUrl] = useState('');
  const [bridgeCommand, setBridgeCommand] = useState('');
  const [iconKey, setIconKey] = useState<IconKey>('layers');
  const [size, setSize] = useState<CardSize>('standard');
  const [pinnedToDock, setPinnedToDock] = useState(false);

  const hasDesktopPicker = typeof window !== 'undefined' && Boolean(window.launcher59Desktop);

  useEffect(() => {
    if (editingShortcut) {
      setName(editingShortcut.name);
      setEnglishName(editingShortcut.englishName);
      setDescription(editingShortcut.description);
      setCategory(editingShortcut.category);
      setLaunchType(editingShortcut.launchType);
      setTarget(editingShortcut.target);
      setFallbackWebUrl(editingShortcut.fallbackWebUrl ?? '');
      setBridgeCommand(editingShortcut.bridgeCommand ?? '');
      setIconKey(editingShortcut.iconKey);
      setSize(editingShortcut.size);
      setPinnedToDock(editingShortcut.pinnedToDock);
    } else {
      setName('');
      setEnglishName('');
      setDescription('');
      setCategory('productivity');
      setLaunchType(hasDesktopPicker ? 'bridge' : 'web');
      setTarget(hasDesktopPicker ? '' : 'https://');
      setFallbackWebUrl('');
      setBridgeCommand('');
      setIconKey('layers');
      setSize('standard');
      setPinnedToDock(false);
    }
  }, [editingShortcut, open, hasDesktopPicker]);

  if (!open) return null;

  const handleBrowseExecutable = async () => {
    if (!window.launcher59Desktop) return;
    const selected = await window.launcher59Desktop.pickExecutable();
    if (selected) {
      setLaunchType('bridge');
      setTarget(selected);
      setBridgeCommand(selected);
      if (!name.trim()) {
        const base = selected.split(/[\\/]/).pop()?.replace(/\.(exe|lnk|bat|cmd)$/i, '') || '';
        if (base) {
          setName(base);
          setEnglishName(base);
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !target.trim()) return;
    onSave({
      id: editingShortcut?.id,
      name: name.trim(),
      englishName: englishName.trim() || name.trim(),
      description: description.trim() || 'میانبر اختصاصی کاربر در LAUNCHER 59',
      category,
      launchType,
      target: target.trim(),
      fallbackWebUrl: fallbackWebUrl.trim() || undefined,
      bridgeCommand: bridgeCommand.trim() || undefined,
      iconKey,
      size,
      pinnedToDock,
      lastLaunchedAt: editingShortcut?.lastLaunchedAt,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#041124]/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={editingShortcut ? 'ویرایش نرم‌افزار' : 'افزودن نرم‌افزار'}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl acrylic-modal rounded-2xl p-6 max-h-[90vh] overflow-y-auto space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#B9DDFF]/15">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#65D5FF]" />
            <h2 className="text-base font-semibold text-[#F5FAFF]">
              {editingShortcut ? 'ویرایش میانبر نرم‌افزار' : 'افزودن میانبر نرم‌افزار جدید'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-[#B9DDFF] hover:text-[#F5FAFF]"
            aria-label="بستن"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs text-[#B9DDFF]/85 mb-1">نام فارسی نرم‌افزار *</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: فتوشاپ یا پنل پروژه‌ها"
              className="w-full px-3 py-2 rounded-xl bg-white/8 border border-[#B9DDFF]/22 text-sm text-[#F5FAFF] focus:outline-none focus:border-[#65D5FF]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#B9DDFF]/85 mb-1">نام انگلیسی (برای جستجو)</label>
            <input
              dir="ltr"
              type="text"
              value={englishName}
              onChange={(e) => setEnglishName(e.target.value)}
              placeholder="e.g. Photoshop"
              className="w-full px-3 py-2 rounded-xl bg-white/8 border border-[#B9DDFF]/22 text-sm text-[#F5FAFF] focus:outline-none focus:border-[#65D5FF]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-[#B9DDFF]/85 mb-1">توضیح کوتاه</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="کاربرد یا توضیح کوتاه نرم‌افزار..."
            className="w-full px-3 py-2 rounded-xl bg-white/8 border border-[#B9DDFF]/22 text-sm text-[#F5FAFF] focus:outline-none focus:border-[#65D5FF]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs text-[#B9DDFF]/85 mb-1">دسته‌بندی</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as AppCategory)}
              className="w-full px-3 py-2 rounded-xl bg-[#092347] border border-[#B9DDFF]/22 text-sm text-[#F5FAFF] focus:outline-none focus:border-[#65D5FF]"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-[#B9DDFF]/85 mb-1">روش اجرا</label>
            <select
              value={launchType}
              onChange={(e) => setLaunchType(e.target.value as LaunchType)}
              className="w-full px-3 py-2 rounded-xl bg-[#092347] border border-[#B9DDFF]/22 text-sm text-[#F5FAFF] focus:outline-none focus:border-[#65D5FF]"
            >
              <option value="bridge">مسیر فایل اجرایی ویندوز (.exe / .lnk)</option>
              <option value="uri">پروتکل ویندوز (URI مانند vscode://)</option>
              <option value="web">نشانی وب (https://...)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs text-[#B9DDFF]/85">هدف اجرا (مسیر / URI / URL) *</label>
              {hasDesktopPicker && (
                <button
                  type="button"
                  onClick={handleBrowseExecutable}
                  className="inline-flex items-center gap-1 text-[11px] text-[#65D5FF] hover:underline"
                >
                  <FolderSearch className="w-3.5 h-3.5" />
                  <span>انتخاب فایل از سیستم</span>
                </button>
              )}
            </div>
            <input
              required
              dir="ltr"
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder={
                launchType === 'web'
                  ? 'https://example.com'
                  : launchType === 'uri'
                    ? 'ms-settings:'
                    : 'C:\\Program Files\\App\\app.exe'
              }
              className="w-full px-3 py-2 rounded-xl bg-white/8 border border-[#B9DDFF]/22 text-sm font-mono-tabular text-[#F5FAFF] focus:outline-none focus:border-[#65D5FF]"
            />
          </div>

          <div>
            <label className="block text-xs text-[#B9DDFF]/85 mb-1">نسخه وب جایگزین (اختیاری)</label>
            <input
              dir="ltr"
              type="url"
              value={fallbackWebUrl}
              onChange={(e) => setFallbackWebUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-xl bg-white/8 border border-[#B9DDFF]/22 text-sm font-mono-tabular text-[#F5FAFF] focus:outline-none focus:border-[#65D5FF]"
            />
          </div>
        </div>

        {launchType !== 'web' && (
          <div>
            <label className="block text-xs text-[#B9DDFF]/85 mb-1">مسیر اجرایی بومی ویندوز (اختیاری)</label>
            <input
              dir="ltr"
              type="text"
              value={bridgeCommand}
              onChange={(e) => setBridgeCommand(e.target.value)}
              placeholder="مثال: wt.exe یا C:\Program Files\..."
              className="w-full px-3 py-2 rounded-xl bg-white/8 border border-[#B9DDFF]/22 text-sm font-mono-tabular text-[#F5FAFF] focus:outline-none focus:border-[#65D5FF]"
            />
          </div>
        )}

        <div>
          <label className="block text-xs text-[#B9DDFF]/85 mb-2">انتخاب آیکون</label>
          <div className="grid grid-cols-8 gap-2">
            {ICON_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setIconKey(opt.key)}
                title={opt.label}
                className={`h-10 rounded-xl border flex items-center justify-center transition-colors ${
                  iconKey === opt.key
                    ? 'bg-[#0078D4] border-[#65D5FF] text-[#F5FAFF]'
                    : 'bg-white/6 border-[#B9DDFF]/18 text-[#B9DDFF] hover:bg-white/12'
                }`}
              >
                <AppIcon iconKey={opt.key} className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs text-[#F5FAFF] cursor-pointer">
              <input
                type="checkbox"
                checked={size === 'featured'}
                onChange={(e) => setSize(e.target.checked ? 'featured' : 'standard')}
                className="accent-[#38A9FF]"
              />
              <span>کارت عریض (برجسته)</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-[#F5FAFF] cursor-pointer">
              <input
                type="checkbox"
                checked={pinnedToDock}
                onChange={(e) => setPinnedToDock(e.target.checked)}
                className="accent-[#38A9FF]"
              />
              <span>سنجاق به نوار پایینی</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-white/8 hover:bg-white/15 text-[#E5F2FF] transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-[#0078D4] hover:bg-[#198AE0] text-[#F5FAFF] transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>ذخیره میانبر</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
