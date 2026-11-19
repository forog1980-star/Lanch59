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
  getAutoStart: () => Promise<boolean>;
  setAutoStart: (enabled: boolean) => Promise<boolean>;
  setAlwaysOnTop: (enabled: boolean) => Promise<boolean>;
  setMinimizeToTray: (enabled: boolean) => Promise<boolean>;
  setWindowMode: (payload: {
    mode: 'closed' | 'radial' | 'settings';
    ringSize?: RingSize;
    stageSize?: number;
  }) => Promise<PlacementContext | void>;
  moveWindowBy: (dx: number, dy: number) => Promise<void>;
  setPositionPreset: (preset: PositionPreset) => Promise<PlacementContext | void>;
  readUserFile: (name: 'shortcuts' | 'settings' | 'notes') => Promise<string | null>;
  writeUserFile: (name: 'shortcuts' | 'settings' | 'notes', content: string) => Promise<boolean>;
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
