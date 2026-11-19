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
