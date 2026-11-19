import React from 'react';
import {
  PlugZap,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  StickyNote,
} from 'lucide-react';
import { AppShortcut } from '../types/launcher';
import { AppIcon } from './icons/AppIcon';

interface QuickDockProps {
  pinnedShortcuts: AppShortcut[];
  editMode: boolean;
  bridgeConnected: boolean;
  onLaunch: (shortcut: AppShortcut) => void;
  onFocusSearch: () => void;
  onAddShortcut: () => void;
  onToggleEditMode: () => void;
  onOpenNotes: () => void;
  onOpenBridge: () => void;
  onOpenSettings: () => void;
}

export const QuickDock: React.FC<QuickDockProps> = ({
  pinnedShortcuts,
  editMode,
  bridgeConnected,
  onLaunch,
  onFocusSearch,
  onAddShortcut,
  onToggleEditMode,
  onOpenNotes,
  onOpenBridge,
  onOpenSettings,
}) => {
  return (
    <nav
      aria-label="نوار ابزار سریع"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-[94vw]"
    >
      <div className="acrylic-dock rounded-2xl px-3 py-2 flex items-center gap-1.5 sm:gap-2 overflow-x-auto">
        {/* Pinned Shortcuts */}
        {pinnedShortcuts.map((item) => (
          <button
            key={`dock-${item.id}`}
            type="button"
            onClick={() => onLaunch(item)}
            title={`${item.name} (${item.englishName})`}
            aria-label={`اجرای سریع ${item.name}`}
            className="group relative w-10 h-10 rounded-xl bg-white/8 hover:bg-[#0078D4]/55 border border-transparent hover:border-[#65D5FF]/45 flex items-center justify-center text-[#EBF6FF] transition-all hover:-translate-y-1 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#65D5FF]"
          >
            <AppIcon iconKey={item.iconKey} className="w-5 h-5" />
          </button>
        ))}

        {pinnedShortcuts.length > 0 && (
          <div className="w-px h-6 bg-[#B9DDFF]/25 mx-1 shrink-0" aria-hidden="true" />
        )}

        {/* Quick System & Customization Actions */}
        <button
          type="button"
          onClick={onFocusSearch}
          title="جستجوی سریع (Ctrl + K)"
          aria-label="جستجوی سریع"
          className="w-10 h-10 rounded-xl hover:bg-white/14 flex items-center justify-center text-[#B9DDFF] hover:text-[#F5FAFF] transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#65D5FF]"
        >
          <Search className="w-5 h-5" strokeWidth={1.8} />
        </button>

        <button
          type="button"
          onClick={onAddShortcut}
          title="افزودن میانبر جدید"
          aria-label="افزودن میانبر جدید"
          className="w-10 h-10 rounded-xl hover:bg-white/14 flex items-center justify-center text-[#B9DDFF] hover:text-[#F5FAFF] transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#65D5FF]"
        >
          <Plus className="w-5 h-5" strokeWidth={1.8} />
        </button>

        <button
          type="button"
          onClick={onToggleEditMode}
          title="شخصی‌سازی و جابه‌جایی کارت‌ها"
          aria-label="شخصی‌سازی چیدمان"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#65D5FF] ${
            editMode
              ? 'bg-[#0078D4]/70 text-[#F5FAFF] border border-[#65D5FF]/50'
              : 'hover:bg-white/14 text-[#B9DDFF] hover:text-[#F5FAFF]'
          }`}
        >
          <SlidersHorizontal className="w-5 h-5" strokeWidth={1.8} />
        </button>

        <button
          type="button"
          onClick={onOpenNotes}
          title="یادداشت سریع دسکتاپ"
          aria-label="یادداشت سریع"
          className="w-10 h-10 rounded-xl hover:bg-white/14 flex items-center justify-center text-[#B9DDFF] hover:text-[#F5FAFF] transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#65D5FF]"
        >
          <StickyNote className="w-5 h-5" strokeWidth={1.8} />
        </button>

        <button
          type="button"
          onClick={onOpenBridge}
          title="پل محلی ویندوز ۱۱"
          aria-label="پل محلی ویندوز"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#65D5FF] ${
            bridgeConnected
              ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-300/35'
              : 'hover:bg-white/14 text-[#B9DDFF] hover:text-[#F5FAFF]'
          }`}
        >
          <PlugZap className="w-5 h-5" strokeWidth={1.8} />
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          title="تنظیمات LAUNCHER 59"
          aria-label="تنظیمات"
          className="w-10 h-10 rounded-xl hover:bg-white/14 flex items-center justify-center text-[#B9DDFF] hover:text-[#F5FAFF] transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#65D5FF]"
        >
          <Settings className="w-5 h-5" strokeWidth={1.8} />
        </button>
      </div>
    </nav>
  );
};
