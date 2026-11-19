export type AppCategory =
  | 'development'
  | 'productivity'
  | 'design'
  | 'system'
  | 'media'
  | 'web';

export type LaunchType = 'uri' | 'web' | 'bridge';

export type CardSize = 'standard' | 'featured';

export type IconKey =
  | 'code'
  | 'terminal'
  | 'settings'
  | 'browser'
  | 'calculator'
  | 'store'
  | 'figma'
  | 'music'
  | 'notes'
  | 'mail'
  | 'git'
  | 'folder'
  | 'globe'
  | 'cpu'
  | 'layers'
  | 'command';

export type RingSize = 'small' | 'medium' | 'large';
export type GlowTheme = 'azure' | 'cyan' | 'indigo';
export type AppearancePresetId =
  | 'fluent-azure'
  | 'electric-cyan'
  | 'sapphire-prism'
  | 'emerald-glass'
  | 'violet-aurora'
  | 'amber-solar'
  | 'rose-crystal'
  | 'custom';

export type IconDisplayStyle = 'glass-circle' | 'rounded-square' | 'floating-clean';
export type AppIconSource = 'extracted' | 'custom' | 'brand' | 'builtin';

export interface AppearanceSettings {
  // Dimensions
  orbSizeClosed: number; // px (default 42 — ~1/3 of v2.0.2 116px)
  orbOpenScale: number; // multiplier when open (default 1.28)
  radialIconSize: number; // px node diameter (default 54)
  radialIconSpacing: number; // multiplier 0.8..1.35 (default 1.0)
  radialRadius: number; // px ring radius (default 150)

  // Color & Light
  presetId: AppearancePresetId;
  primaryColor: string; // hex
  secondaryColor: string; // hex
  ringColor: string; // hex
  colorVibrancy: number; // 0.5..1.6 (default 1.18)
  glassTransparency: number; // 0.15..0.92 (default 0.42)
  reflectionIntensity: number; // 0..1.5 (default 1.0)
  shadowDepth: number; // 0..1.5 (default 1.0)

  // Visual Effects & Icon Display
  glassBlur: number; // px 4..36 (default 22)
  globalOpacity: number; // 0.4..1.0 (default 1.0)
  iconDisplayStyle: IconDisplayStyle;
  iconImageScale: number; // 0.55..0.92 (default 0.72)
}

export type PositionPreset =
  | 'center'
  | 'top'
  | 'bottom-center'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'custom';

export interface AppShortcut {
  id: string;
  name: string;
  englishName: string;
  description: string;
  category: AppCategory;
  launchType: LaunchType;
  target: string;
  fallbackWebUrl?: string;
  bridgeCommand?: string;
  iconKey: IconKey;
  /** Optional v2.1.0 per-app independent icon metadata (backward-compatible) */
  brandIconKey?: string;
  iconSource?: AppIconSource;
  customIconDataUrl?: string;
  originalIconDataUrl?: string;
  extractedIconVariants?: string[];
  resolvedExePath?: string;
  size: CardSize;
  pinnedToDock: boolean;
  order: number;
  lastLaunchedAt?: number;
  launchCount: number;
}

export interface LauncherSettings {
  reduceMotion: boolean;
  use24HourClock: boolean;
  usePersianDigits: boolean;
  showGregorianDate: boolean;
  haloIntensity: 'subtle' | 'balanced' | 'radiant';
  ringSize: RingSize;
  glowTheme: GlowTheme;
  alwaysOnTop: boolean;
  minimizeToTray: boolean;
  positionPreset: PositionPreset;
  orbOffset: { x: number; y: number };
  autoFadeEnabled: boolean;
  idleOpacity: number;
  idleDelaySeconds: number;
  bridgeUrl: string;
  userName: string;
  userRole: string;
  /** Optional v2.1.0 appearance & customization settings (merged safely on load) */
  appearance?: AppearanceSettings;
}

export interface LauncherNotification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  kind: 'info' | 'launch' | 'system' | 'warning';
  read: boolean;
}

export interface BridgeSystemStats {
  hostname: string;
  osVersion: string;
  cpuModel: string;
  cpuUsagePercent: number;
  totalMemoryGb: number;
  usedMemoryGb: number;
  diskDrive: string;
  diskFreeGb: number;
  diskTotalGb: number;
  uptimeHours: number;
  runningProcessesSample?: string[];
}

export interface SystemMetrics {
  online: boolean;
  connectionType: string | null;
  downlinkMbps: number | null;
  cpuCores: number | null;
  deviceMemoryGb: number | null;
  jsHeapUsedMb: number | null;
  jsHeapLimitMb: number | null;
  storageUsedMb: number | null;
  storageQuotaMb: number | null;
  bridgeConnected: boolean;
  bridgeStats: BridgeSystemStats | null;
  lastUpdated: number;
}
