import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import backdropImg from './assets/images/win11_blue_bloom_backdrop_1795005618866.jpg';
import { RadialLauncher } from './components/RadialLauncher';
import { RadialManagerModal } from './components/modals/RadialManagerModal';
import { DEFAULT_SETTINGS, DEFAULT_SHORTCUTS } from './data/defaultShortcuts';
import { DesktopInfo, PlacementContext } from './types/desktop';
import {
  AppShortcut,
  LauncherSettings,
  PositionPreset,
  SystemMetrics,
} from './types/launcher';
import { executeShortcutLaunch } from './utils/launcherActions';
import {
  clampWebOrbOffset,
  computeAdaptiveRadialLayout,
  getWebPresetOffset,
} from './utils/radialPlacement';
import {
  loadSettings,
  loadShortcuts,
  saveSettings,
  saveShortcuts,
} from './utils/storage';
import { collectRealSystemMetrics } from './utils/systemTelemetry';

interface ToastState {
  id: string;
  ok: boolean;
  message: string;
}

export default function App() {
  const isDesktop = typeof window !== 'undefined' && Boolean(window.launcher59Desktop);

  const [settings, setSettings] = useState<LauncherSettings>(() => loadSettings());
  const [shortcuts, setShortcuts] = useState<AppShortcut[]>(() => loadShortcuts());
  const [desktopInfo, setDesktopInfo] = useState<DesktopInfo | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [webOrbOffset, setWebOrbOffset] = useState<{ x: number; y: number }>(
    () => clampWebOrbOffset(loadSettings().orbOffset ?? { x: 0, y: 0 })
  );
  const [viewportSize, setViewportSize] = useState<{ width: number; height: number }>(() =>
    typeof window !== 'undefined'
      ? { width: window.innerWidth, height: window.innerHeight }
      : { width: 1280, height: 800 }
  );
  const [placementContext, setPlacementContext] = useState<PlacementContext | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const [metrics, setMetrics] = useState<SystemMetrics>({
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
    connectionType: null,
    downlinkMbps: null,
    cpuCores: typeof navigator !== 'undefined' ? navigator.hardwareConcurrency ?? null : null,
    deviceMemoryGb: null,
    jsHeapUsedMb: null,
    jsHeapLimitMb: null,
    storageUsedMb: null,
    storageQuotaMb: null,
    bridgeConnected: false,
    bridgeStats: null,
    lastUpdated: Date.now(),
  });

  const toastTimerRef = useRef<number | null>(null);

  const persistShortcuts = useCallback((next: AppShortcut[]) => {
    saveShortcuts(next);
    if (window.launcher59Desktop) {
      window.launcher59Desktop
        .writeUserFile('shortcuts', JSON.stringify(next, null, 2))
        .catch(() => {});
    }
  }, []);

  const persistSettings = useCallback((next: LauncherSettings) => {
    saveSettings(next);
    if (window.launcher59Desktop) {
      window.launcher59Desktop
        .writeUserFile('settings', JSON.stringify(next, null, 2))
        .catch(() => {});
    }
  }, []);

  const showToast = useCallback((ok: boolean, message: string) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast({
      id: String(Date.now()),
      ok,
      message,
    });
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 3400);
  }, []);

  // Desktop transparency mode & initial local file hydration
  useEffect(() => {
    if (!window.launcher59Desktop) return;
    document.documentElement.classList.add('desktop-transparent');
    document.body.classList.add('desktop-transparent');

    const desktop = window.launcher59Desktop;
    desktop.getInfo().then(setDesktopInfo).catch(() => {});
    desktop.getPlacementContext().then(setPlacementContext).catch(() => {});

    Promise.all([desktop.readUserFile('settings'), desktop.readUserFile('shortcuts')])
      .then(([rawSettings, rawShortcuts]) => {
        if (rawSettings) {
          try {
            const parsed = { ...DEFAULT_SETTINGS, ...JSON.parse(rawSettings) };
            setSettings(parsed);
            saveSettings(parsed);
          } catch {
            // ignore corrupted user settings
          }
        }
        if (rawShortcuts) {
          try {
            const parsed = JSON.parse(rawShortcuts);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setShortcuts(parsed);
              saveShortcuts(parsed);
            }
          } catch {
            // ignore corrupted shortcuts
          }
        }
      })
      .catch(() => {});

    const unsubscribe = desktop.onTrayCommand((cmd) => {
      if (cmd === 'toggle-ring') {
        setSettingsOpen(false);
        setIsOpen((prev) => !prev);
      } else if (cmd === 'close-ring') {
        setIsOpen(false);
      } else if (cmd === 'open-settings') {
        setIsOpen(false);
        setSettingsOpen(true);
      } else if (cmd === 'display-changed') {
        desktop.getPlacementContext().then(setPlacementContext).catch(() => {});
      } else if (cmd === 'always-on-top:true' || cmd === 'always-on-top:false') {
        const nextVal = cmd === 'always-on-top:true';
        setSettings((prev) => {
          const next = { ...prev, alwaysOnTop: nextVal };
          saveSettings(next);
          return next;
        });
      }
    });

    return () => {
      unsubscribe();
      document.documentElement.classList.remove('desktop-transparent');
      document.body.classList.remove('desktop-transparent');
    };
  }, []);

  // Keep Web Preview viewport & orb offset inside screen bounds on resize
  useEffect(() => {
    if (isDesktop || typeof window === 'undefined') return;
    const handleResize = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
      setWebOrbOffset((prev) => clampWebOrbOffset(prev));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isDesktop]);

  const adaptiveLayout = useMemo(() => {
    if (isDesktop && placementContext) {
      return computeAdaptiveRadialLayout({
        orbCenterX: placementContext.orbCenterX,
        orbCenterY: placementContext.orbCenterY,
        workArea: placementContext.workArea,
        ringSize: settings.ringSize,
      });
    }
    return computeAdaptiveRadialLayout({
      orbCenterX: Math.round(viewportSize.width / 2 + webOrbOffset.x),
      orbCenterY: Math.round(viewportSize.height / 2 + webOrbOffset.y),
      workArea: { x: 0, y: 0, width: viewportSize.width, height: viewportSize.height },
      ringSize: settings.ringSize,
    });
  }, [isDesktop, placementContext, viewportSize, webOrbOffset, settings.ringSize]);

  // Sync floating Electron window bounds to current radial state
  useEffect(() => {
    if (!window.launcher59Desktop) return;
    const mode = settingsOpen ? 'settings' : isOpen ? 'radial' : 'closed';
    window.launcher59Desktop
      .setWindowMode({
        mode,
        ringSize: settings.ringSize,
        stageSize: adaptiveLayout.stageSize,
      })
      .catch(() => {});
  }, [isOpen, settingsOpen, settings.ringSize, adaptiveLayout.stageSize]);

  // Refresh system metrics only while Settings submenu is open
  useEffect(() => {
    if (!settingsOpen) return;
    let active = true;
    const load = async () => {
      const next = await collectRealSystemMetrics(settings.bridgeUrl);
      if (active) setMetrics(next);
      if (active && window.launcher59Desktop) {
        window.launcher59Desktop.getInfo().then((info) => {
          if (active) setDesktopInfo(info);
        }).catch(() => {});
      }
    };
    load();
    const id = window.setInterval(load, 4000);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, [settingsOpen, settings.bridgeUrl]);

  // Escape closes settings first, then radial ring
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (settingsOpen) {
          setSettingsOpen(false);
        } else if (isOpen) {
          setIsOpen(false);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, settingsOpen]);

  const updateSettings = useCallback(
    (partial: Partial<LauncherSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...partial };
        persistSettings(next);
        return next;
      });
    },
    [persistSettings]
  );

  const sortedShortcuts = useMemo(
    () => [...shortcuts].sort((a, b) => a.order - b.order),
    [shortcuts]
  );

  const handleLaunchShortcut = async (shortcut: AppShortcut) => {
    const result = await executeShortcutLaunch(
      shortcut,
      settings.bridgeUrl,
      metrics.bridgeConnected,
      false
    );

    if (result.ok) {
      setShortcuts((prev) => {
        const next = prev.map((item) =>
          item.id === shortcut.id
            ? {
                ...item,
                launchCount: item.launchCount + 1,
                lastLaunchedAt: Date.now(),
              }
            : item
        );
        persistShortcuts(next);
        return next;
      });
      if (!isDesktop) {
        showToast(true, result.message);
      }
    } else {
      showToast(false, result.message);
    }
  };

  const handleMoveShortcut = (id: string, direction: 'prev' | 'next') => {
    setShortcuts((prev) => {
      const ordered = [...prev].sort((a, b) => a.order - b.order);
      const idx = ordered.findIndex((s) => s.id === id);
      if (idx === -1) return prev;
      const targetIdx = direction === 'prev' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= ordered.length) return prev;
      const copy = [...ordered];
      const [moved] = copy.splice(idx, 1);
      copy.splice(targetIdx, 0, moved);
      const normalized = copy.map((item, i) => ({ ...item, order: i }));
      persistShortcuts(normalized);
      return normalized;
    });
  };

  const handleSaveShortcut = (
    payload: Omit<AppShortcut, 'id' | 'order' | 'launchCount'> & { id?: string }
  ) => {
    setShortcuts((prev) => {
      let next: AppShortcut[];
      if (payload.id) {
        next = prev.map((item) =>
          item.id === payload.id ? { ...item, ...payload, id: item.id } : item
        );
        showToast(true, `«${payload.name}» به‌روزرسانی شد.`);
      } else {
        const added: AppShortcut = {
          ...payload,
          id: `custom-${Date.now()}`,
          order: prev.length,
          launchCount: 0,
        };
        next = [...prev, added];
        showToast(true, `«${payload.name}» به حلقه اضافه شد.`);
      }
      persistShortcuts(next);
      return next;
    });
  };

  const handleDeleteShortcut = (id: string) => {
    setShortcuts((prev) => {
      const target = prev.find((s) => s.id === id);
      const next = prev
        .filter((s) => s.id !== id)
        .map((item, i) => ({ ...item, order: i }));
      persistShortcuts(next);
      if (target) showToast(true, `«${target.name}» حذف شد.`);
      return next;
    });
  };

  const handleSetPositionPreset = (preset: PositionPreset) => {
    if (isDesktop && window.launcher59Desktop) {
      updateSettings({ positionPreset: preset });
      window.launcher59Desktop
        .setPositionPreset(preset)
        .then((ctx) => {
          if (ctx) setPlacementContext(ctx);
        })
        .catch(() => {});
    } else {
      const offset = getWebPresetOffset(preset);
      setWebOrbOffset(offset);
      updateSettings({ positionPreset: preset, orbOffset: offset });
    }
  };

  const handleCommitDesktopDrag = useCallback(() => {
    if (!window.launcher59Desktop) return;
    updateSettings({ positionPreset: 'custom' });
    window.launcher59Desktop
      .getPlacementContext()
      .then(setPlacementContext)
      .catch(() => {});
  }, [updateSettings]);

  const handleImportBackup = (data: {
    settings?: LauncherSettings;
    shortcuts?: AppShortcut[];
  }) => {
    if (data.settings) {
      const merged = { ...DEFAULT_SETTINGS, ...data.settings };
      setSettings(merged);
      persistSettings(merged);
      window.launcher59Desktop?.setAlwaysOnTop(merged.alwaysOnTop).catch(() => {});
    }
    if (Array.isArray(data.shortcuts) && data.shortcuts.length > 0) {
      setShortcuts(data.shortcuts);
      persistShortcuts(data.shortcuts);
    }
    showToast(true, 'پشتیبان محلی بازیابی شد.');
  };

  const handleResetDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
    persistSettings(DEFAULT_SETTINGS);
    window.launcher59Desktop?.setAlwaysOnTop(DEFAULT_SETTINGS.alwaysOnTop).catch(() => {});
    setShortcuts(DEFAULT_SHORTCUTS);
    persistShortcuts(DEFAULT_SHORTCUTS);
    if (!isDesktop) {
      setWebOrbOffset({ x: 0, y: 0 });
    } else {
      window.launcher59Desktop
        ?.setPositionPreset('center')
        .then((ctx) => {
          if (ctx) setPlacementContext(ctx);
        })
        .catch(() => {});
    }
    showToast(true, 'تنظیمات به حالت پیش‌فرض بازگردانده شدند.');
  };

  return (
    <div
      onClick={() => {
        if (isOpen) setIsOpen(false);
      }}
      className={`relative w-screen h-screen flex items-center justify-center overflow-hidden text-[#F5FAFF] ${
        settings.reduceMotion ? 'reduce-motion' : ''
      } ${isDesktop ? 'bg-transparent' : 'bg-[#071D3A]'}`}
    >
      {/* Subtle Windows 11 Atmospheric Backdrop (Web Preview Only — Transparent in Desktop App) */}
      {!isDesktop && (
        <div className="fixed inset-0 pointer-events-none select-none overflow-hidden">
          <img
            src={backdropImg}
            alt="پس‌زمینه دسکتاپ ویندوز"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-55 scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 75% 65% at 50% 50%, rgba(56, 169, 255, 0.14) 0%, rgba(7, 29, 58, 0.84) 100%)',
            }}
          />
        </div>
      )}

      {/* Minimal Floating Circular 59 Radial Launcher */}
      <RadialLauncher
        shortcuts={sortedShortcuts}
        settings={settings}
        isOpen={isOpen}
        settingsOpen={settingsOpen}
        isDesktop={isDesktop}
        orbOffset={webOrbOffset}
        adaptiveLayout={adaptiveLayout}
        onToggleOpen={() => setIsOpen((prev) => !prev)}
        onCloseRing={() => setIsOpen(false)}
        onLaunch={handleLaunchShortcut}
        onOpenSettings={() => {
          setIsOpen(false);
          setSettingsOpen(true);
        }}
        onMoveWebOrb={(offset) => setWebOrbOffset(offset)}
        onCommitWebOrb={(finalOffset) => {
          setWebOrbOffset(finalOffset);
          updateSettings({ positionPreset: 'custom', orbOffset: finalOffset });
        }}
        onCommitDesktopDrag={handleCommitDesktopDrag}
      />

      {/* Transient Minimal Action Toast (Auto-dismisses) */}
      {toast && !settingsOpen && (
        <div
          role="status"
          aria-live="polite"
          onClick={(e) => e.stopPropagation()}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-[90vw]"
        >
          <div className="acrylic-tooltip rounded-full px-3.5 py-1.5 flex items-center gap-2 text-xs text-[#F5FAFF]">
            {toast.ok ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#65D5FF] shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            )}
            <span className="truncate max-w-[320px]">{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="بستن اعلان"
              className="p-0.5 rounded-full hover:bg-white/10 text-[#B9DDFF] cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Hidden Settings & App Manager Modal (Opened only on Demand) */}
      <RadialManagerModal
        open={settingsOpen}
        shortcuts={sortedShortcuts}
        settings={settings}
        metrics={metrics}
        desktopInfo={desktopInfo}
        onClose={() => setSettingsOpen(false)}
        onUpdateSettings={updateSettings}
        onSaveShortcut={handleSaveShortcut}
        onDeleteShortcut={handleDeleteShortcut}
        onMoveShortcut={handleMoveShortcut}
        onSetPositionPreset={handleSetPositionPreset}
        onImportBackup={handleImportBackup}
        onResetDefaults={handleResetDefaults}
      />
    </div>
  );
}
