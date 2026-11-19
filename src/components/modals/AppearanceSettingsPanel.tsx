import React, { useMemo } from 'react';
import { RotateCcw, Sparkles, SlidersHorizontal, SunMedium, Shapes, Move } from 'lucide-react';
import {
  AppearanceSettings,
  LauncherSettings,
  PositionPreset,
  RingSize,
} from '../../types/launcher';
import {
  APPEARANCE_COLOR_PRESETS,
  computeOrbMetrics,
  computeVisualStyles,
  ICON_DISPLAY_OPTIONS,
  resolveAppearance,
  RING_SIZE_DEFAULTS,
} from '../../utils/appearanceConfig';
import { toDisplayDigits } from '../../utils/formatters';
import { KnownBrandIcon } from '../icons/KnownAppIcons';

interface AppearanceSettingsPanelProps {
  settings: LauncherSettings;
  onUpdateSettings: (partial: Partial<LauncherSettings>) => void;
  onSetPositionPreset: (preset: PositionPreset) => void;
  onResetAppearance: () => void;
}

export const AppearanceSettingsPanel: React.FC<AppearanceSettingsPanelProps> = ({
  settings,
  onUpdateSettings,
  onSetPositionPreset,
  onResetAppearance,
}) => {
  const appearance = useMemo(() => resolveAppearance(settings), [settings]);
  const visuals = useMemo(
    () => computeVisualStyles(appearance, settings.haloIntensity, false),
    [appearance, settings.haloIntensity]
  );
  const metrics = useMemo(() => computeOrbMetrics(appearance, false), [appearance]);
  const persian = settings.usePersianDigits;

  const updateAppearance = (patch: Partial<AppearanceSettings>, extra?: Partial<LauncherSettings>) => {
    const nextAppearance: AppearanceSettings = {
      ...appearance,
      ...patch,
    };
    onUpdateSettings({
      ...extra,
      appearance: nextAppearance,
    });
  };

  const handleSelectPreset = (preset: (typeof APPEARANCE_COLOR_PRESETS)[number]) => {
    updateAppearance(
      {
        presetId: preset.id,
        primaryColor: preset.primaryColor,
        secondaryColor: preset.secondaryColor,
        ringColor: preset.ringColor,
      },
      { glowTheme: preset.legacyGlowTheme }
    );
  };

  const handleQuickRingSize = (size: RingSize) => {
    const defaults = RING_SIZE_DEFAULTS[size];
    updateAppearance(
      {
        radialRadius: defaults.radialRadius,
        radialIconSize: defaults.radialIconSize,
      },
      { ringSize: size }
    );
  };

  // Clamped preview diameter so mini preview box stays clean even if user chooses 128px
  const previewOrbSize = Math.min(64, Math.max(36, appearance.orbSizeClosed));
  const previewFontSize = Math.max(15, Math.round(previewOrbSize * 0.45));
  const previewNodeSize = Math.min(54, Math.max(38, appearance.radialIconSize));

  return (
    <div className="space-y-4">
      {/* Live Mini Preview & Reset Appearance Header */}
      <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          {/* Live Orb Preview */}
          <div className="relative w-[76px] h-[76px] flex items-center justify-center shrink-0">
            <div
              aria-hidden="true"
              className="absolute rounded-full pointer-events-none"
              style={{
                width: `${previewOrbSize + 22}px`,
                height: `${previewOrbSize + 22}px`,
                background: visuals.auraBackground,
                filter: 'blur(9px)',
                opacity: 0.72,
              }}
            />
            <div
              className="relative rounded-full flex items-center justify-center overflow-hidden"
              style={{
                width: `${previewOrbSize}px`,
                height: `${previewOrbSize}px`,
                background: visuals.orbBackground,
                boxShadow: visuals.orbBoxShadow,
                backdropFilter: visuals.orbBackdropFilter,
                opacity: appearance.globalOpacity,
              }}
            >
              <span
                className="pointer-events-none absolute inset-[2px] rounded-full"
                style={{ background: visuals.specularBackground }}
              />
              <span
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{ background: visuals.bottomBounceBackground }}
              />
              <svg
                aria-hidden="true"
                viewBox="0 0 100 100"
                className="pointer-events-none absolute inset-0 w-full h-full"
              >
                <defs>
                  <linearGradient id="preview-orb-ring" x1="15%" y1="10%" x2="85%" y2="90%">
                    <stop offset="0%" stopColor={visuals.ringPrimaryStop} stopOpacity="0.95" />
                    <stop offset="50%" stopColor={visuals.ringAccentStop} stopOpacity="0.72" />
                    <stop offset="100%" stopColor={visuals.ringPrimaryStop} stopOpacity="0.95" />
                  </linearGradient>
                </defs>
                <circle
                  cx="50"
                  cy="50"
                  r="47.2"
                  fill="none"
                  stroke="url(#preview-orb-ring)"
                  strokeWidth="2.4"
                />
              </svg>
              <span
                dir="ltr"
                className="number-59-glass-v2 relative z-10 font-display font-bold leading-none select-none"
                style={{ fontSize: `${previewFontSize}px` }}
              >
                59
              </span>
            </div>
          </div>

          {/* Live Radial Node Preview */}
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: `${previewNodeSize}px`,
                height: `${previewNodeSize}px`,
                borderRadius: visuals.nodeStyle.borderRadius,
                background: visuals.nodeStyle.background,
                border: visuals.nodeStyle.border,
                backdropFilter: visuals.nodeStyle.backdropFilter,
                boxShadow: visuals.nodeStyle.boxShadow,
                opacity: appearance.globalOpacity,
              }}
            >
              <span
                className="inline-flex items-center justify-center"
                style={{
                  width: `${Math.round(previewNodeSize * appearance.iconImageScale)}px`,
                  height: `${Math.round(previewNodeSize * appearance.iconImageScale)}px`,
                }}
              >
                <KnownBrandIcon brandKey="word" className="w-full h-full" />
              </span>
            </div>
            <div className="text-[11px] leading-relaxed">
              <div className="font-semibold text-[#F5FAFF]">پیش‌نمایش زنده ظاهر</div>
              <div className="text-[#B9DDFF]/75 font-mono-tabular">
                گوی بسته: {toDisplayDigits(metrics.closedDiameter, persian)}px • باز:{' '}
                {toDisplayDigits(metrics.openDiameter, persian)}px
              </div>
              <div className="text-[#B9DDFF]/75 font-mono-tabular">
                آیکون حلقه: {toDisplayDigits(appearance.radialIconSize, persian)}px
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onResetAppearance}
          title="فقط ظاهر و رنگ‌بندی را به پیش‌فرض نسخه 2.1.0 برمی‌گرداند و میانبرها حفظ می‌شوند"
          className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/12 border border-white/12 text-[11px] text-[#B9DDFF] hover:text-[#F5FAFF] cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>بازنشانی ظاهر</span>
        </button>
      </div>

      {/* Section 1: Dimensions & Proportions */}
      <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#65D5FF]">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>ابعاد گوی و حلقه</span>
          </div>
          <div className="flex items-center gap-1">
            {[
              { px: 42, label: '۴۲px' },
              { px: 56, label: '۵۶px' },
              { px: 84, label: '۸۴px' },
            ].map((q) => (
              <button
                key={q.px}
                type="button"
                onClick={() => updateAppearance({ orbSizeClosed: q.px })}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-mono-tabular border cursor-pointer transition-colors ${
                  appearance.orbSizeClosed === q.px
                    ? 'bg-[#0078D4]/45 border-[#65D5FF] text-[#F5FAFF]'
                    : 'bg-white/5 border-white/10 text-[#B9DDFF] hover:bg-white/10'
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Closed Orb Diameter */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-[#B9DDFF] mb-1">
              <span>اندازه گوی (حالت بسته)</span>
              <span className="font-mono-tabular text-[#65D5FF]">
                {toDisplayDigits(appearance.orbSizeClosed, persian)}px
              </span>
            </div>
            <input
              type="range"
              min={36}
              max={128}
              step={2}
              value={appearance.orbSizeClosed}
              onChange={(e) => updateAppearance({ orbSizeClosed: Number(e.target.value) })}
              className="w-full accent-[#38A9FF] cursor-pointer"
            />
          </div>

          {/* Open Scale */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-[#B9DDFF] mb-1">
              <span>بزرگ‌نمایی گوی در حالت باز</span>
              <span className="font-mono-tabular text-[#65D5FF]">
                {toDisplayDigits(Math.round(appearance.orbOpenScale * 100), persian)}%
              </span>
            </div>
            <input
              type="range"
              min={100}
              max={160}
              step={4}
              value={Math.round(appearance.orbOpenScale * 100)}
              onChange={(e) => updateAppearance({ orbOpenScale: Number(e.target.value) / 100 })}
              className="w-full accent-[#38A9FF] cursor-pointer"
            />
          </div>

          {/* Radial Icon Size */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-[#B9DDFF] mb-1">
              <span>اندازه آیکون‌های حلقه</span>
              <span className="font-mono-tabular text-[#65D5FF]">
                {toDisplayDigits(appearance.radialIconSize, persian)}px
              </span>
            </div>
            <input
              type="range"
              min={38}
              max={76}
              step={2}
              value={appearance.radialIconSize}
              onChange={(e) => updateAppearance({ radialIconSize: Number(e.target.value) })}
              className="w-full accent-[#38A9FF] cursor-pointer"
            />
          </div>

          {/* Radial Radius */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-[#B9DDFF] mb-1">
              <span>شعاع حلقه برنامه‌ها</span>
              <span className="font-mono-tabular text-[#65D5FF]">
                {toDisplayDigits(appearance.radialRadius, persian)}px
              </span>
            </div>
            <input
              type="range"
              min={105}
              max={220}
              step={5}
              value={appearance.radialRadius}
              onChange={(e) => updateAppearance({ radialRadius: Number(e.target.value) })}
              className="w-full accent-[#38A9FF] cursor-pointer"
            />
          </div>

          {/* Radial Icon Spacing */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-[#B9DDFF] mb-1">
              <span>فاصله و گشادگی آیکون‌ها</span>
              <span className="font-mono-tabular text-[#65D5FF]">
                {toDisplayDigits(Math.round(appearance.radialIconSpacing * 100), persian)}%
              </span>
            </div>
            <input
              type="range"
              min={80}
              max={135}
              step={5}
              value={Math.round(appearance.radialIconSpacing * 100)}
              onChange={(e) =>
                updateAppearance({ radialIconSpacing: Number(e.target.value) / 100 })
              }
              className="w-full accent-[#38A9FF] cursor-pointer"
            />
          </div>

          {/* Quick Ring Size Presets */}
          <div>
            <div className="text-[11px] text-[#B9DDFF] mb-1">تناسب سریع حلقه</div>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { key: 'small', label: 'فشرده' },
                  { key: 'medium', label: 'متعادل' },
                  { key: 'large', label: 'گسترده' },
                ] as { key: RingSize; label: string }[]
              ).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleQuickRingSize(opt.key)}
                  className={`py-1.5 rounded-lg border text-[11px] font-medium cursor-pointer transition-colors ${
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
        </div>
      </div>

      {/* Section 2: Curated Presets & Custom Colors */}
      <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#65D5FF]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>تم‌های رنگی و رنگ دلخواه</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {APPEARANCE_COLOR_PRESETS.map((preset) => {
            const active = appearance.presetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`py-1.5 px-2.5 rounded-xl border text-[11px] font-medium flex items-center gap-2 cursor-pointer transition-colors ${
                  active
                    ? 'bg-[#0078D4]/45 border-[#65D5FF] text-[#F5FAFF]'
                    : 'bg-white/5 border-white/10 text-[#B9DDFF] hover:bg-white/10'
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/40"
                  style={{
                    background: `linear-gradient(135deg, ${preset.primaryColor}, ${preset.secondaryColor})`,
                  }}
                />
                <span className="truncate">{preset.label}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Color Swatches */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <label className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
            <span className="text-[11px] text-[#B9DDFF]">رنگ اصلی</span>
            <input
              type="color"
              value={appearance.primaryColor}
              onChange={(e) =>
                updateAppearance({ presetId: 'custom', primaryColor: e.target.value })
              }
              className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
            <span className="text-[11px] text-[#B9DDFF]">رنگ دوم</span>
            <input
              type="color"
              value={appearance.secondaryColor}
              onChange={(e) =>
                updateAppearance({ presetId: 'custom', secondaryColor: e.target.value })
              }
              className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
            <span className="text-[11px] text-[#B9DDFF]">حلقه نور</span>
            <input
              type="color"
              value={appearance.ringColor}
              onChange={(e) => updateAppearance({ presetId: 'custom', ringColor: e.target.value })}
              className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Section 3: Glassmorphism, Light & Optical Depth */}
      <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#65D5FF]">
            <SunMedium className="w-3.5 h-3.5" />
            <span>نور، شیشه‌ای بودن و جلوه‌های بصری</span>
          </div>
          <div className="flex items-center gap-1">
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
                className={`px-2 py-0.5 rounded-lg border text-[10px] font-medium cursor-pointer transition-colors ${
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between text-[11px] text-[#B9DDFF] mb-1">
              <span>سرزندگی و شدت رنگ</span>
              <span className="font-mono-tabular text-[#65D5FF]">
                {toDisplayDigits(Math.round(appearance.colorVibrancy * 100), persian)}%
              </span>
            </div>
            <input
              type="range"
              min={50}
              max={160}
              step={5}
              value={Math.round(appearance.colorVibrancy * 100)}
              onChange={(e) => updateAppearance({ colorVibrancy: Number(e.target.value) / 100 })}
              className="w-full accent-[#38A9FF] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] text-[#B9DDFF] mb-1">
              <span>شفافیت شیشه‌ای (Glass)</span>
              <span className="font-mono-tabular text-[#65D5FF]">
                {toDisplayDigits(Math.round(appearance.glassTransparency * 100), persian)}%
              </span>
            </div>
            <input
              type="range"
              min={15}
              max={90}
              step={5}
              value={Math.round(appearance.glassTransparency * 100)}
              onChange={(e) =>
                updateAppearance({ glassTransparency: Number(e.target.value) / 100 })
              }
              className="w-full accent-[#38A9FF] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] text-[#B9DDFF] mb-1">
              <span>میزان ماتی شیشه (Blur)</span>
              <span className="font-mono-tabular text-[#65D5FF]">
                {toDisplayDigits(appearance.glassBlur, persian)}px
              </span>
            </div>
            <input
              type="range"
              min={4}
              max={36}
              step={2}
              value={appearance.glassBlur}
              onChange={(e) => updateAppearance({ glassBlur: Number(e.target.value) })}
              className="w-full accent-[#38A9FF] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] text-[#B9DDFF] mb-1">
              <span>شدت بازتاب نوری سه‌بعدی</span>
              <span className="font-mono-tabular text-[#65D5FF]">
                {toDisplayDigits(Math.round(appearance.reflectionIntensity * 100), persian)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={150}
              step={5}
              value={Math.round(appearance.reflectionIntensity * 100)}
              onChange={(e) =>
                updateAppearance({ reflectionIntensity: Number(e.target.value) / 100 })
              }
              className="w-full accent-[#38A9FF] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] text-[#B9DDFF] mb-1">
              <span>عمق سایه و هاله</span>
              <span className="font-mono-tabular text-[#65D5FF]">
                {toDisplayDigits(Math.round(appearance.shadowDepth * 100), persian)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={150}
              step={5}
              value={Math.round(appearance.shadowDepth * 100)}
              onChange={(e) => updateAppearance({ shadowDepth: Number(e.target.value) / 100 })}
              className="w-full accent-[#38A9FF] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] text-[#B9DDFF] mb-1">
              <span>شفافیت کلی لانچر</span>
              <span className="font-mono-tabular text-[#65D5FF]">
                {toDisplayDigits(Math.round(appearance.globalOpacity * 100), persian)}%
              </span>
            </div>
            <input
              type="range"
              min={40}
              max={100}
              step={5}
              value={Math.round(appearance.globalOpacity * 100)}
              onChange={(e) => updateAppearance({ globalOpacity: Number(e.target.value) / 100 })}
              className="w-full accent-[#38A9FF] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Section 4: Icon Display Style */}
      <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#65D5FF]">
          <Shapes className="w-3.5 h-3.5" />
          <span>سبک نمایش آیکون‌ها</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {ICON_DISPLAY_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => updateAppearance({ iconDisplayStyle: opt.key })}
              className={`py-2 px-2 rounded-xl border text-[11px] font-medium cursor-pointer transition-colors ${
                appearance.iconDisplayStyle === opt.key
                  ? 'bg-[#0078D4]/45 border-[#65D5FF] text-[#F5FAFF]'
                  : 'bg-white/5 border-white/10 text-[#B9DDFF] hover:bg-white/10'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between text-[11px] text-[#B9DDFF] mb-1">
            <span>مقیاس تصویر آیکون درون قاب</span>
            <span className="font-mono-tabular text-[#65D5FF]">
              {toDisplayDigits(Math.round(appearance.iconImageScale * 100), persian)}%
            </span>
          </div>
          <input
            type="range"
            min={55}
            max={92}
            step={2}
            value={Math.round(appearance.iconImageScale * 100)}
            onChange={(e) => updateAppearance({ iconImageScale: Number(e.target.value) / 100 })}
            className="w-full accent-[#38A9FF] cursor-pointer"
          />
        </div>
      </div>

      {/* Section 5: 9-Point Position Presets (Preserved from v2.0.2) */}
      <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#65D5FF]">
            <Move className="w-3.5 h-3.5" />
            <span>موقعیت سریع ۹گانه (یا جابه‌جایی آزاد با Drag)</span>
          </div>
          <button
            type="button"
            onClick={() => onSetPositionPreset('center')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-[#65D5FF] cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>بازگردانی به مرکز</span>
          </button>
        </div>
        <div dir="ltr" className="grid grid-cols-3 gap-1.5">
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
              className={`py-1.5 px-2 rounded-xl border text-[11px] font-medium cursor-pointer transition-colors ${
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
          <p className="text-[11px] text-[#B9DDFF]/75">
            موقعیت فعلی به‌صورت دستی تنظیم شده و با باز شدن حلقه به‌طور خودکار در محدوده صفحه حفظ می‌شود.
          </p>
        )}
      </div>

      {/* Section 6: Auto-Fade & Reduce Motion (Preserved from v2.0.2) */}
      <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
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
                  {toDisplayDigits(Math.round(settings.idleOpacity * 100), persian)}%
                </span>
              </div>
              <input
                type="range"
                min={15}
                max={85}
                step={5}
                value={Math.round(settings.idleOpacity * 100)}
                onChange={(e) => onUpdateSettings({ idleOpacity: Number(e.target.value) / 100 })}
                className="w-full accent-[#38A9FF] cursor-pointer"
              />
            </div>
            <div>
              <div className="flex items-center justify-between text-[11px] text-[#B9DDFF] mb-1">
                <span>زمان انتظار</span>
                <span className="font-mono-tabular text-[#65D5FF]">
                  {toDisplayDigits(settings.idleDelaySeconds, persian)} ثانیه
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={30}
                step={1}
                value={settings.idleDelaySeconds}
                onChange={(e) => onUpdateSettings({ idleDelaySeconds: Number(e.target.value) })}
                className="w-full accent-[#38A9FF] cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      <label className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 cursor-pointer">
        <span className="text-xs text-[#F5FAFF]">کاهش انیمیشن‌ها (Reduce Motion)</span>
        <input
          type="checkbox"
          checked={settings.reduceMotion}
          onChange={(e) => onUpdateSettings({ reduceMotion: e.target.checked })}
          className="accent-[#38A9FF] w-4 h-4 cursor-pointer"
        />
      </label>
    </div>
  );
};
