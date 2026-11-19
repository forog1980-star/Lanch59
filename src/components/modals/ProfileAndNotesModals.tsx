import React, { useEffect, useState } from 'react';
import { Save, StickyNote, User, X } from 'lucide-react';
import { LauncherSettings } from '../../types/launcher';

interface ProfileModalProps {
  open: boolean;
  settings: LauncherSettings;
  onClose: () => void;
  onSaveProfile: (userName: string, userRole: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  open,
  settings,
  onClose,
  onSaveProfile,
}) => {
  const [name, setName] = useState(settings.userName);
  const [role, setRole] = useState(settings.userRole);

  useEffect(() => {
    setName(settings.userName);
    setRole(settings.userRole);
  }, [settings.userName, settings.userRole, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(name.trim() || 'کاربر ویندوز ۱۱', role.trim() || 'میز کار اختصاصی');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#041124]/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="پروفایل کاربر"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md acrylic-modal rounded-2xl p-6 space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#B9DDFF]/15">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#65D5FF]" />
            <h2 className="text-base font-semibold text-[#F5FAFF]">پروفایل محلی کاربر</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-[#B9DDFF]"
            aria-label="بستن"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <label className="block text-xs text-[#B9DDFF]/85 mb-1">نام نمایشی</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white/8 border border-[#B9DDFF]/22 text-sm text-[#F5FAFF] focus:outline-none focus:border-[#65D5FF]"
          />
        </div>

        <div>
          <label className="block text-xs text-[#B9DDFF]/85 mb-1">عنوان محیط کاری</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white/8 border border-[#B9DDFF]/22 text-sm text-[#F5FAFF] focus:outline-none focus:border-[#65D5FF]"
          />
        </div>

        <p className="text-xs text-[#B9DDFF]/70">
          اطلاعات پروفایل به‌صورت کاملاً محلی روی این مرورگر نگهداری می‌شود.
        </p>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-white/8 hover:bg-white/15 text-[#E5F2FF]"
          >
            انصراف
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-[#0078D4] hover:bg-[#198AE0] text-[#F5FAFF]"
          >
            <Save className="w-4 h-4" />
            <span>ذخیره</span>
          </button>
        </div>
      </form>
    </div>
  );
};

interface ScratchpadDrawerProps {
  open: boolean;
  notes: string;
  onChange: (value: string) => void;
  onClose: () => void;
}

export const ScratchpadDrawer: React.FC<ScratchpadDrawerProps> = ({
  open,
  notes,
  onChange,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-start bg-[#041124]/55 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="یادداشت سریع دسکتاپ"
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md h-full acrylic-modal border-l border-[#B9DDFF]/25 p-5 flex flex-col"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#B9DDFF]/15">
          <div className="flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-[#65D5FF]" />
            <h2 className="text-base font-semibold text-[#F5FAFF]">یادداشت سریع دسکتاپ</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-[#B9DDFF] hover:text-[#F5FAFF]"
            aria-label="بستن یادداشت"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-[#B9DDFF]/75 mt-3 mb-2">
          تغییرات شما بلافاصله در حافظه محلی ذخیره می‌شوند.
        </p>
        <textarea
          value={notes}
          onChange={(e) => onChange(e.target.value)}
          placeholder="کارهای امروز، لینک‌ها یا یادداشت‌های سریع خود را اینجا بنویسید..."
          className="flex-1 w-full rounded-xl bg-white/6 border border-[#B9DDFF]/20 p-4 text-sm text-[#F5FAFF] placeholder:text-[#B9DDFF]/45 leading-relaxed resize-none focus:outline-none focus:border-[#65D5FF]"
        />
      </aside>
    </div>
  );
};
