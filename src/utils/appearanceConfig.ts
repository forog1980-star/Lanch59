import {
  AppearancePresetId,
  AppearanceSettings,
  GlowTheme,
  IconDisplayStyle,
  LauncherSettings,
  RingSize,
} from '../types/launcher';

export interface AppearanceColorPreset {
  id: Exclude<AppearancePresetId, 'custom'>;
  label: string;
  primaryColor: string;
  secondaryColor: string;
  ringColor: string;
  legacyGlowTheme: GlowTheme;
}

export const APPEARANCE_COLOR_PRESETS: AppearanceColorPreset[] = [
  {
    id: 'fluent-azure',
    label: 'آبی فلوئنت ویندوز',
    primaryColor: '#1E9BFF',
    secondaryColor: '#0063E1',
    ringColor: '#76E4FF',
    legacyGlowTheme: 'azure',
  },
  {
    id: 'electric-cyan',
    label: 'فیروزه‌ای درخشان',
    primaryColor: '#14DCE8',
    secondaryColor: '#0284C7',
    ringColor: '#8CF7FF',
    legacyGlowTheme: 'cyan',
  },
  {
    id: 'sapphire-prism',
    label: 'یاقوتی کبود',
    primaryColor: '#4F7BFF',
    secondaryColor: '#2539B8',
    ringColor: '#9CC0FF',
    legacyGlowTheme: 'indigo',
  },
  {
    id: 'emerald-glass',
    label: 'زمردی شیشه‌ای',
    primaryColor: '#10D98F',
    secondaryColor: '#047857',
    ringColor: '#78F8C6',
    legacyGlowTheme: 'cyan',
  },
  {
    id: 'violet-aurora',
    label: 'بنفش شفق',
    primaryColor: '#8B6BFF',
    secondaryColor: '#4C28B8',
    ringColor: '#C5B3FF',
    legacyGlowTheme: 'indigo',
  },
  {
    id: 'amber-solar',
    label: 'کهربایی طلایی',
    primaryColor: '#FF9E2C',
    secondaryColor: '#C2510C',
    ringColor: '#FFD68A',
    legacyGlowTheme: 'azure',
  },
  {
    id: 'rose-crystal',
    label: 'رز کریستالی',
    primaryColor: '#FB569B',
    secondaryColor: '#9F1254',
    ringColor: '#FFA6CC',
    legacyGlowTheme: 'indigo',
  },
];

export const ICON_DISPLAY_OPTIONS: { key: IconDisplayStyle; label: string }[] = [
  { key: 'glass-circle', label: 'دایره شیشه‌ای' },
  { key: 'rounded-square', label: 'مربع گرد مدرن' },
  { key: 'floating-clean', label: 'شناور شفاف' },
];

export const RING_SIZE_DEFAULTS: Record<
  RingSize,
  { radialRadius: number; radialIconSize: number }
> = {
  small: { radialRadius: 122, radialIconSize: 48 },
  medium: { radialRadius: 150, radialIconSize: 54 },
  large: { radialRadius: 180, radialIconSize: 60 },
};

/**
 * Default v2.1.0 appearance settings:
 * - Closed orb diameter starts at 42px (~1/3 of v2.0.2's 116px) for compact desktop footprint
 * - Open orb expands smoothly via orbOpenScale (1.28 -> ~54px) while keeping radial icons full-size (54px)
 * - Higher vibrancy, clean specular light, crisp 3D depth, and seamless SVG luminous ring
 */
export const DEFAULT_APPEARANCE: AppearanceSettings = {
  orbSizeClosed: 42,
  orbOpenScale: 1.28,
  radialIconSize: 54,
  radialIconSpacing: 1.0,
  radialRadius: 150,

  presetId: 'fluent-azure',
  primaryColor: '#1E9BFF',
  secondaryColor: '#0063E1',
  ringColor: '#76E4FF',
  colorVibrancy: 1.18,
  glassTransparency: 0.42,
  reflectionIntensity: 1.0,
  shadowDepth: 1.0,

  glassBlur: 22,
  globalOpacity: 1.0,
  iconDisplayStyle: 'glass-circle',
  iconImageScale: 0.72,
};

function clamp(val: number, min: number, max: number): number {
  if (!Number.isFinite(val)) return min;
  return Math.max(min, Math.min(max, val));
}

function isValidHex(color: unknown): color is string {
  return typeof color === 'string' && /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(color.trim());
}

function expandHex(hex: string): string {
  const clean = hex.trim().replace('#', '');
  if (clean.length === 3) {
    return `#${clean[0]}${clean[0]}${clean[1]}${clean[1]}${clean[2]}${clean[2]}`;
  }
  return `#${clean}`;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const full = isValidHex(hex) ? expandHex(hex) : '#1E9BFF';
  const num = parseInt(full.slice(1), 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function hexToRgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  const a = clamp(alpha, 0, 1);
  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`;
}

export function lightenHex(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const t = clamp(amount, 0, 1);
  const nr = Math.round(r + (255 - r) * t);
  const ng = Math.round(g + (255 - g) * t);
  const nb = Math.round(b + (255 - b) * t);
  return `rgb(${nr}, ${ng}, ${nb})`;
}

export function darkenHex(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const t = clamp(amount, 0, 1);
  const nr = Math.round(r * (1 - t));
  const ng = Math.round(g * (1 - t));
  const nb = Math.round(b * (1 - t));
  return `rgb(${nr}, ${ng}, ${nb})`;
}

/**
 * Resolves a complete, validated AppearanceSettings object from any v2.0.2 or v2.1.0 LauncherSettings.
 * Backward-compatible: maps legacy glowTheme & ringSize cleanly when v2.1.0 appearance is not yet persisted.
 */
export function resolveAppearance(settings: LauncherSettings): AppearanceSettings {
  const legacyPreset =
    APPEARANCE_COLOR_PRESETS.find((p) => p.legacyGlowTheme === settings.glowTheme) ||
    APPEARANCE_COLOR_PRESETS[0];
  const legacyRing = RING_SIZE_DEFAULTS[settings.ringSize] || RING_SIZE_DEFAULTS.medium;

  const raw = settings.appearance;
  if (!raw) {
    return {
      ...DEFAULT_APPEARANCE,
      presetId: legacyPreset.id,
      primaryColor: legacyPreset.primaryColor,
      secondaryColor: legacyPreset.secondaryColor,
      ringColor: legacyPreset.ringColor,
      radialRadius: legacyRing.radialRadius,
      radialIconSize: legacyRing.radialIconSize,
    };
  }

  return {
    orbSizeClosed: Math.round(clamp(raw.orbSizeClosed ?? DEFAULT_APPEARANCE.orbSizeClosed, 36, 128)),
    orbOpenScale: clamp(raw.orbOpenScale ?? DEFAULT_APPEARANCE.orbOpenScale, 1.0, 1.6),
    radialIconSize: Math.round(clamp(raw.radialIconSize ?? legacyRing.radialIconSize, 38, 76)),
    radialIconSpacing: clamp(raw.radialIconSpacing ?? DEFAULT_APPEARANCE.radialIconSpacing, 0.8, 1.35),
    radialRadius: Math.round(clamp(raw.radialRadius ?? legacyRing.radialRadius, 105, 220)),

    presetId: raw.presetId || 'fluent-azure',
    primaryColor: isValidHex(raw.primaryColor) ? expandHex(raw.primaryColor) : legacyPreset.primaryColor,
    secondaryColor: isValidHex(raw.secondaryColor) ? expandHex(raw.secondaryColor) : legacyPreset.secondaryColor,
    ringColor: isValidHex(raw.ringColor) ? expandHex(raw.ringColor) : legacyPreset.ringColor,
    colorVibrancy: clamp(raw.colorVibrancy ?? DEFAULT_APPEARANCE.colorVibrancy, 0.5, 1.6),
    glassTransparency: clamp(raw.glassTransparency ?? DEFAULT_APPEARANCE.glassTransparency, 0.15, 0.92),
    reflectionIntensity: clamp(raw.reflectionIntensity ?? DEFAULT_APPEARANCE.reflectionIntensity, 0, 1.5),
    shadowDepth: clamp(raw.shadowDepth ?? DEFAULT_APPEARANCE.shadowDepth, 0, 1.5),

    glassBlur: Math.round(clamp(raw.glassBlur ?? DEFAULT_APPEARANCE.glassBlur, 4, 36)),
    globalOpacity: clamp(raw.globalOpacity ?? DEFAULT_APPEARANCE.globalOpacity, 0.4, 1.0),
    iconDisplayStyle:
      raw.iconDisplayStyle === 'rounded-square' || raw.iconDisplayStyle === 'floating-clean'
        ? raw.iconDisplayStyle
        : 'glass-circle',
    iconImageScale: clamp(raw.iconImageScale ?? DEFAULT_APPEARANCE.iconImageScale, 0.55, 0.92),
  };
}

/**
 * Computes closed and open orb diameter & optical 59 font size so 59 stays sharp & balanced at every scale.
 */
export function computeOrbMetrics(appearance: AppearanceSettings, isOpen: boolean): {
  closedDiameter: number;
  openDiameter: number;
  activeDiameter: number;
  fontSizePx: number;
  closedStagePx: number;
} {
  const closedDiameter = appearance.orbSizeClosed;
  // Cap open orb diameter so it never collides with inner radial nodes
  const maxSafeOpen = Math.max(closedDiameter, Math.min(118, Math.round(appearance.radialRadius * 0.72)));
  const openDiameter = Math.min(maxSafeOpen, Math.round(closedDiameter * appearance.orbOpenScale));
  const activeDiameter = isOpen ? openDiameter : closedDiameter;

  // Optical scale tuned for crisp 59 legibility even at 36-44px
  const fontRatio = activeDiameter <= 48 ? 0.46 : activeDiameter <= 72 ? 0.45 : 0.43;
  const fontSizePx = Math.max(15, Math.round(activeDiameter * fontRatio));

  // Generous transparent stage margin around closed orb so blur/shadow NEVER clips into a dark square edge
  const closedStagePx = Math.max(124, Math.ceil(closedDiameter + 84));

  return {
    closedDiameter,
    openDiameter,
    activeDiameter,
    fontSizePx,
    closedStagePx,
  };
}

export interface ComputedOrbVisuals {
  orbBackground: string;
  orbBoxShadow: string;
  orbBackdropFilter: string;
  auraBackground: string;
  specularBackground: string;
  bottomBounceBackground: string;
  ringPrimaryStop: string;
  ringAccentStop: string;
  ringGlowColor: string;
  nodeStyle: {
    borderRadius: string;
    background: string;
    border: string;
    backdropFilter: string;
    boxShadow: string;
  };
}

/**
 * Generates vibrant Windows 11 Fluent glassmorphism & 3D optical styles from AppearanceSettings.
 */
export function computeVisualStyles(
  appearance: AppearanceSettings,
  haloIntensity: LauncherSettings['haloIntensity'],
  isOpen: boolean
): ComputedOrbVisuals {
  const haloBoost = haloIntensity === 'subtle' ? 0.65 : haloIntensity === 'radiant' ? 1.25 : 1.0;
  const vib = appearance.colorVibrancy * haloBoost;
  const trans = appearance.glassTransparency; // 0.15 (more solid) .. 0.92 (more transparent)
  const solidFactor = 1 - trans * 0.62;
  const refl = appearance.reflectionIntensity;
  const shd = appearance.shadowDepth;

  const highlightAlpha = clamp(0.46 * refl, 0.05, 0.72);
  const midPrimaryAlpha = clamp(0.42 * vib * solidFactor, 0.16, 0.86);
  const deepSecondaryAlpha = clamp(0.76 * solidFactor, 0.24, 0.94);

  const orbBackground = `radial-gradient(circle at 30% 24%, rgba(255, 255, 255, ${highlightAlpha.toFixed(
    3
  )}) 0%, ${hexToRgba(appearance.primaryColor, midPrimaryAlpha)} 38%, ${hexToRgba(
    appearance.secondaryColor,
    deepSecondaryAlpha
  )} 78%, ${hexToRgba('#041530', clamp(0.84 * solidFactor, 0.34, 0.94))} 100%)`;

  const glowSpread = isOpen ? Math.round(24 * shd) : Math.round(16 * shd);
  const dropBlur = Math.round(22 * shd);
  const dropY = Math.round(8 * shd);
  const outerGlowAlpha = clamp((isOpen ? 0.52 : 0.38) * vib, 0.08, 0.78);
  const dropAlpha = clamp(0.56 * shd, 0.05, 0.78);

  const orbBoxShadow = [
    `0 0 ${glowSpread}px ${hexToRgba(appearance.ringColor, outerGlowAlpha)}`,
    `0 ${dropY}px ${dropBlur}px -4px rgba(2, 11, 28, ${dropAlpha.toFixed(3)})`,
    `inset 0 1.5px 2px rgba(255, 255, 255, ${clamp(0.55 * refl, 0.08, 0.85).toFixed(3)})`,
    `inset 0 -6px 14px -2px ${hexToRgba(appearance.secondaryColor, clamp(0.58 * vib, 0.15, 0.85))}`,
  ].join(', ');

  const blurPx = appearance.glassBlur;
  const satPct = Math.round(145 + appearance.colorVibrancy * 48);
  const orbBackdropFilter = `blur(${blurPx}px) saturate(${satPct}%)`;

  const auraBackground = `radial-gradient(circle, ${hexToRgba(
    appearance.primaryColor,
    clamp(0.48 * vib, 0.1, 0.72)
  )} 0%, ${hexToRgba(
    appearance.secondaryColor,
    clamp(0.24 * vib, 0.04, 0.45)
  )} 42%, transparent 72%)`;

  const specularBackground = `linear-gradient(155deg, rgba(255, 255, 255, ${clamp(
    0.58 * refl,
    0,
    0.82
  ).toFixed(3)}) 0%, rgba(255, 255, 255, ${clamp(0.14 * refl, 0, 0.32).toFixed(
    3
  )}) 44%, transparent 64%)`;

  const bottomBounceBackground = `radial-gradient(ellipse 75% 45% at 50% 96%, ${hexToRgba(
    appearance.ringColor,
    clamp(0.52 * refl * vib, 0, 0.85)
  )} 0%, transparent 72%)`;

  const nodeRadius =
    appearance.iconDisplayStyle === 'rounded-square'
      ? '16px'
      : appearance.iconDisplayStyle === 'floating-clean'
        ? '14px'
        : '9999px';

  const isCleanFloating = appearance.iconDisplayStyle === 'floating-clean';
  const nodeStyle = {
    borderRadius: nodeRadius,
    background: isCleanFloating
      ? `radial-gradient(circle, ${hexToRgba(appearance.primaryColor, 0.14)} 0%, rgba(7, 25, 52, 0.32) 100%)`
      : `linear-gradient(145deg, rgba(255, 255, 255, ${clamp(0.24 * refl, 0.06, 0.42).toFixed(
          3
        )}) 0%, ${hexToRgba(appearance.primaryColor, clamp(0.22 * vib * solidFactor, 0.08, 0.48))} 48%, ${hexToRgba(
          '#071C3B',
          clamp(0.76 * solidFactor, 0.3, 0.9)
        )} 100%)`,
    border: isCleanFloating
      ? `1px solid ${hexToRgba(appearance.ringColor, 0.18)}`
      : `1px solid ${hexToRgba(appearance.ringColor, clamp(0.38 * vib, 0.18, 0.65))}`,
    backdropFilter: `blur(${Math.max(8, Math.round(blurPx * 0.82))}px) saturate(${satPct}%)`,
    boxShadow: isCleanFloating
      ? `0 6px 18px -4px rgba(2, 12, 28, ${clamp(0.42 * shd, 0.08, 0.65).toFixed(3)})`
      : `0 ${Math.round(8 * shd)}px ${Math.round(22 * shd)}px -5px rgba(2, 12, 28, ${clamp(
          0.62 * shd,
          0.12,
          0.8
        ).toFixed(3)}), inset 0 1px 1px rgba(255, 255, 255, ${clamp(0.4 * refl, 0.08, 0.65).toFixed(3)})`,
  };

  return {
    orbBackground,
    orbBoxShadow,
    orbBackdropFilter,
    auraBackground,
    specularBackground,
    bottomBounceBackground,
    ringPrimaryStop: lightenHex(appearance.ringColor, 0.18),
    ringAccentStop: appearance.primaryColor,
    ringGlowColor: hexToRgba(appearance.ringColor, clamp(0.68 * vib, 0.2, 0.95)),
    nodeStyle,
  };
}
