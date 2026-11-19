import { BridgeSystemStats, PositionPreset, RingSize } from './launcher';

export interface DesktopInfo {
  isDesktop: boolean;
  platform: string;
  arch: string;
  appVersion: string;
  userDataPath: string;
  startupMs: number;
  memoryRssMb: number;
  alwaysOnTop: boolean;
  minimizeToTray: boolean;
}

export interface DesktopLaunchResult {
  ok: boolean;
  mode: 'desktop-uri' | 'desktop-path' | 'desktop-exe' | 'blocked';
  message: string;
}

export interface PlacementContext {
  orbCenterX: number;
  orbCenterY: number;
  workArea: { x: number; y: number; width: number; height: number };
  displayId: number;
}

export interface ExtractedAppIconResult {
  ok: boolean;
  originalPath: string;
  resolvedPath: string;
  detectedName: string;
  icons: string[];
  primaryIcon: string | null;
  iconSourcePath?: string;
  error?: string;
}

export interface Launcher59DesktopAPI {
  getInfo: () => Promise<DesktopInfo>;
  getSystemStats: () => Promise<BridgeSystemStats & { processRssMb: number; startupMs: number }>;
  getPlacementContext: () => Promise<PlacementContext>;
  launchTarget: (payload: {
    launchType: 'uri' | 'web' | 'bridge';
    target: string;
    bridgeCommand?: string;
    preferWeb?: boolean;
    fallbackWebUrl?: string;
  }) => Promise<DesktopLaunchResult>;
  pickExecutable: () => Promise<string | null>;
  extractAppIcons: (filePath: string) => Promise<ExtractedAppIconResult>;
  pickIconImage: () => Promise<{ ok: boolean; dataUrl?: string; icons?: string[]; filePath?: string; error?: string }>;
  saveAppIcon: (appId: string, dataUrl: string, variant?: 'active' | 'original') => Promise<boolean>;
  deleteAppIcon: (appId: string) => Promise<boolean>;
  getAutoStart: () => Promise<boolean>;
  setAutoStart: (enabled: boolean) => Promise<boolean>;
  setAlwaysOnTop: (enabled: boolean) => Promise<boolean>;
  setMinimizeToTray: (enabled: boolean) => Promise<boolean>;
  setWindowMode: (payload: {
    mode: 'closed' | 'radial' | 'settings';
    ringSize?: RingSize;
    stageSize?: number;
    orbSize?: number;
  }) => Promise<PlacementContext | void>;
  moveWindowBy: (dx: number, dy: number) => Promise<void>;
  setPositionPreset: (preset: PositionPreset) => Promise<PlacementContext | void>;
  readUserFile: (name: 'shortcuts' | 'settings' | 'notes' | 'icons') => Promise<string | null>;
  writeUserFile: (name: 'shortcuts' | 'settings' | 'notes' | 'icons', content: string) => Promise<boolean>;
  notify: (title: string, body: string) => Promise<void>;
  windowAction: (action: 'minimize' | 'maximize' | 'close' | 'quit') => Promise<void>;
  onTrayCommand: (
    cb: (
      command:
        | 'toggle-ring'
        | 'open-settings'
        | 'close-ring'
        | 'always-on-top:true'
        | 'always-on-top:false'
        | 'display-changed'
    ) => void
  ) => () => void;
}

declare global {
  interface Window {
    launcher59Desktop?: Launcher59DesktopAPI;
  }
}
