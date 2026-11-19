import React from 'react';
import { Clock, Plus, SearchX, SlidersHorizontal } from 'lucide-react';
import { CATEGORY_LABELS } from '../data/defaultShortcuts';
import { AppCategory, AppShortcut, LauncherSettings } from '../types/launcher';
import { AppIcon } from './icons/AppIcon';
import { ShortcutCard } from './ShortcutCard';

export type FilterKey = AppCategory | 'all' | 'recent';

interface ShortcutGridProps {
  shortcuts: AppShortcut[];
  filteredShortcuts: AppShortcut[];
  recentShortcuts: AppShortcut[];
  activeFilter: FilterKey;
  onFilterChange: (filter: FilterKey) => void;
  searchQuery: string;
  onClearSearch: () => void;
  settings: LauncherSettings;
  bridgeConnected: boolean;
  editMode: boolean;
  onToggleEditMode: () => void;
  onAddShortcut: () => void;
  onLaunch: (shortcut: AppShortcut, preferFallbackWeb?: boolean) => void;
  onMove: (id: string, direction: 'prev' | 'next') => void;
  onToggleSize: (id: string) => void;
  onTogglePin: (id: string) => void;
  onEdit: (shortcut: AppShortcut) => void;
  onDelete: (id: string) => void;
}

const FILTER_ORDER: FilterKey[] = [
  'all',
  'recent',
  'development',
  'system',
  'productivity',
  'design',
  'media',
  'web',
];

export const ShortcutGrid: React.FC<ShortcutGridProps> = ({
  shortcuts,
  filteredShortcuts,
  recentShortcuts,
  activeFilter,
  onFilterChange,
  searchQuery,
  onClearSearch,
  settings,
  bridgeConnected,
  editMode,
  onToggleEditMode,
  onAddShortcut,
  onLaunch,
  onMove,
  onToggleSize,
  onTogglePin,
  onEdit,
  onDelete,
}) => {
  return (
    <section
      aria-label="نرم‌افزارهای منتخب"
      className="w-full max-w-[1380px] mx-auto px-4 sm:px-8 mt-6 pb-28"
    >
      {/* Recent / Frequent Strip when user has launched apps */}
      {recentShortcuts.length > 0 && activeFilter === 'all' && !searchQuery.trim() && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2.5 text-xs font-medium text-[#B9DDFF]/85">
            <Clock className="w-3.5 h-3.5 text-[#65D5FF]" />
            <span>نرم‌افزارهای اخیر و پرکاربرد</span>
          </div>
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
            {recentShortcuts.map((item) => (
              <button
                key={`recent-${item.id}`}
                type="button"
                onClick={() => onLaunch(item)}
                className="acrylic-surface rounded-xl px-3.5 py-2 flex items-center gap-2.5 hover:border-[#65D5FF]/50 hover:bg-white/12 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#65D5FF]"
              >
                <AppIcon iconKey={item.iconKey} className="w-4 h-4 text-[#65D5FF]" />
                <span className="text-xs font-medium text-[#F5FAFF] whitespace-nowrap">
                  {item.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Section Header & Segmented Category Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-1.5 p-1.5 acrylic-surface rounded-2xl overflow-x-auto">
          {FILTER_ORDER.map((key) => {
            const active = activeFilter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onFilterChange(key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#65D5FF] ${
                  active
                    ? 'bg-[#0078D4] text-[#F5FAFF] shadow-sm'
                    : 'text-[#B9DDFF]/80 hover:text-[#F5FAFF] hover:bg-white/10'
                }`}
              >
                {CATEGORY_LABELS[key]}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onToggleEditMode}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#65D5FF] ${
              editMode
                ? 'bg-[#38A9FF]/25 border-[#65D5FF]/60 text-[#F5FAFF]'
                : 'bg-white/8 border-[#B9DDFF]/22 text-[#E5F2FF] hover:bg-white/14'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" strokeWidth={1.8} />
            <span>{editMode ? 'پایان ویرایش چیدمان' : 'سفارشی‌سازی چیدمان'}</span>
          </button>

          <button
            type="button"
            onClick={onAddShortcut}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-[#0078D4] hover:bg-[#198AE0] text-[#F5FAFF] border border-[#65D5FF]/35 shadow-sm transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#65D5FF]"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>افزودن نرم‌افزار</span>
          </button>
        </div>
      </div>

      {/* Cards Grid or Empty State */}
      {filteredShortcuts.length === 0 ? (
        <div className="acrylic-surface rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0078D4]/30 border border-[#65D5FF]/30 flex items-center justify-center text-[#65D5FF]">
            <SearchX className="w-6 h-6" strokeWidth={1.75} />
          </div>
          <h3 className="text-base font-semibold text-[#F5FAFF]">
            {searchQuery
              ? `هیچ نرم‌افزاری مطابق «${searchQuery}» یافت نشد`
              : 'هنوز نرم‌افزاری در این بخش ثبت نشده است'}
          </h3>
          <p className="text-xs sm:text-sm text-[#B9DDFF]/75 max-w-md">
            {searchQuery
              ? 'می‌توانید جستجو را پاک کنید یا یک میانبر اختصاصی جدید بسازید.'
              : 'برای نمایش در این دسته‌بندی، یک میانبر جدید اضافه کنید یا برنامه‌ای را اجرا نمایید.'}
          </p>
          <div className="flex items-center gap-3 mt-2">
            {searchQuery && (
              <button
                type="button"
                onClick={onClearSearch}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-white/10 hover:bg-white/16 text-[#F5FAFF] transition-colors"
              >
                پاک کردن جستجو
              </button>
            )}
            <button
              type="button"
              onClick={onAddShortcut}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-[#0078D4] hover:bg-[#198AE0] text-[#F5FAFF] transition-colors"
            >
              افزودن میانبر جدید
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredShortcuts.map((shortcut) => {
            const globalIndex = shortcuts.findIndex((s) => s.id === shortcut.id);
            return (
              <ShortcutCard
                key={shortcut.id}
                shortcut={shortcut}
                settings={settings}
                bridgeConnected={bridgeConnected}
                editMode={editMode}
                canMovePrev={globalIndex > 0}
                canMoveNext={globalIndex >= 0 && globalIndex < shortcuts.length - 1}
                onLaunch={onLaunch}
                onMove={onMove}
                onToggleSize={onToggleSize}
                onTogglePin={onTogglePin}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            );
          })}
        </div>
      )}
    </section>
  );
};
