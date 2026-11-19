import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { useIdleFade } from '../hooks/useIdleFade';
import { AppShortcut, GlowTheme, LauncherSettings } from '../types/launcher';
import { toDisplayDigits } from '../utils/formatters';
import {
  AdaptiveRadialLayout,
  clampWebOrbOffset,
  getAdaptiveTooltipSide,
} from '../utils/radialPlacement';
import { AppIcon } from './icons/AppIcon';

interface RadialLauncherProps {
  shortcuts: AppShortcut[];
  settings: LauncherSettings;
  isOpen: boolean;
  settingsOpen: boolean;
  isDesktop: boolean;
  orbOffset: { x: number; y: number };
  adaptiveLayout: AdaptiveRadialLayout;
  onToggleOpen: () => void;
  onCloseRing: () => void;
  onLaunch: (shortcut: AppShortcut) => void;
  onOpenSettings: () => void;
  onMoveWebOrb: (nextOffset: { x: number; y: number }) => void;
  onCommitWebOrb: (finalOffset: { x: number; y: number }) => void;
  onCommitDesktopDrag?: () => void;
}

const ICONS_PER_PAGE = 8;

const GLOW_PALETTES: Record<
  GlowTheme,
  {
    primary: string;
    secondary: string;
    ringStroke: string;
    border: string;
  }
> = {
  azure: {
    primary: 'rgba(56, 169, 255, 0.58)',
    secondary: 'rgba(0, 120, 212, 0.45)',
    ringStroke: 'rgba(101, 213, 255, 0.48)',
    border: 'rgba(101, 213, 255, 0.52)',
  },
  cyan: {
    primary: 'rgba(34, 211, 238, 0.62)',
    secondary: 'rgba(6, 182, 212, 0.46)',
    ringStroke: 'rgba(103, 232, 249, 0.56)',
    border: 'rgba(103, 232, 249, 0.58)',
  },
  indigo: {
    primary: 'rgba(129, 140, 248, 0.58)',
    secondary: 'rgba(79, 70, 229, 0.45)',
    ringStroke: 'rgba(165, 180, 252, 0.52)',
    border: 'rgba(165, 180, 252, 0.52)',
  },
};

const INTENSITY_OPACITY: Record<LauncherSettings['haloIntensity'], number> = {
  subtle: 0.42,
  balanced: 0.72,
  radiant: 1,
};

export const RadialLauncher: React.FC<RadialLauncherProps> = ({
  shortcuts,
  settings,
  isOpen,
  settingsOpen,
  isDesktop,
  orbOffset,
  adaptiveLayout,
  onToggleOpen,
  onCloseRing,
  onLaunch,
  onOpenSettings,
  onMoveWebOrb,
  onCommitWebOrb,
  onCommitDesktopDrag,
}) => {
  const [page, setPage] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHoveredOrb, setIsHoveredOrb] = useState(false);

  const { isIdle, effectiveOpacity, wake } = useIdleFade({
    enabled: settings.autoFadeEnabled,
    delaySeconds: settings.idleDelaySeconds,
    idleOpacity: settings.idleOpacity,
    isPaused: isOpen || settingsOpen || isHoveredOrb || isDragging,
  });

  const dragRef = useRef<{
    active: boolean;
    moved: boolean;
    startClientX: number;
    startClientY: number;
    lastScreenX: number;
    lastScreenY: number;
    startOffsetX: number;
    startOffsetY: number;
    latestOffset: { x: number; y: number };
  }>({
    active: false,
    moved: false,
    startClientX: 0,
    startClientY: 0,
    lastScreenX: 0,
    lastScreenY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
    latestOffset: orbOffset,
  });

  const palette = GLOW_PALETTES[settings.glowTheme];
  const intensity = INTENSITY_OPACITY[settings.haloIntensity];

  const totalPages = Math.max(1, Math.ceil(shortcuts.length / ICONS_PER_PAGE));

  useEffect(() => {
    if (page >= totalPages) {
      setPage(0);
    }
  }, [page, totalPages]);

  useEffect(() => {
    if (!isOpen) {
      setHoveredId(null);
    }
  }, [isOpen]);

  const pageShortcuts = useMemo(() => {
    const start = page * ICONS_PER_PAGE;
    return shortcuts.slice(start, start + ICONS_PER_PAGE);
  }, [shortcuts, page]);

  const handleOrbPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    wake();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      active: true,
      moved: false,
      startClientX: e.clientX,
      startClientY: e.clientY,
      lastScreenX: e.screenX,
      lastScreenY: e.screenY,
      startOffsetX: orbOffset.x,
      startOffsetY: orbOffset.y,
      latestOffset: orbOffset,
    };
  };

  const handleOrbPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const state = dragRef.current;
    if (!state.active) return;

    const totalDist = Math.hypot(
      e.clientX - state.startClientX,
      e.clientY - state.startClientY
    );

    if (!state.moved && totalDist >= 5) {
      state.moved = true;
      setIsDragging(true);
    }

    if (!state.moved) return;

    if (isDesktop && window.launcher59Desktop) {
      const dx = Math.round(e.screenX - state.lastScreenX);
      const dy = Math.round(e.screenY - state.lastScreenY);
      if (dx !== 0 || dy !== 0) {
        state.lastScreenX = e.screenX;
        state.lastScreenY = e.screenY;
        window.launcher59Desktop.moveWindowBy(dx, dy).catch(() => {});
      }
    } else {
      const next = clampWebOrbOffset({
        x: state.startOffsetX + (e.clientX - state.startClientX),
        y: state.startOffsetY + (e.clientY - state.startClientY),
      });
      state.latestOffset = next;
      onMoveWebOrb(next);
    }
  };

  const handleOrbPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const state = dragRef.current;
    if (!state.active) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    const wasDragged = state.moved;
    state.active = false;
    setIsDragging(false);

    if (wasDragged) {
      if (!isDesktop) {
        onCommitWebOrb(state.latestOffset);
      } else {
        onCommitDesktopDrag?.();
      }
    } else {
      onToggleOpen();
    }
  };

  const handleWheelRing = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!isOpen || totalPages <= 1) return;
    if (Math.abs(e.deltaY) < 6 && Math.abs(e.deltaX) < 6) return;
    const forward = e.deltaY > 0 || e.deltaX > 0;
    setPage((prev) => (forward ? (prev + 1) % totalPages : (prev - 1 + totalPages) % totalPages));
  };

  const transitionSpring = settings.reduceMotion
    ? { duration: 0.01 }
    : { type: 'spring' as const, stiffness: 310, damping: 26, mass: 0.8 };

  const stagePx = isOpen ? adaptiveLayout.stageSize : 164;
  const webShiftX = orbOffset.x + (isOpen ? adaptiveLayout.openShiftX : 0);
  const webShiftY = orbOffset.y + (isOpen ? adaptiveLayout.openShiftY : 0);
  const opacityDuration = settings.reduceMotion ? 0 : isIdle ? 520 : 220;

  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{
        width: `${stagePx}px`,
        height: `${stagePx}px`,
        opacity: isOpen ? 1 : effectiveOpacity,
        transform: isDesktop
          ? undefined
          : `translate3d(${webShiftX}px, ${webShiftY}px, 0)`,
        transition:
          isDragging || settings.reduceMotion
            ? `opacity ${opacityDuration}ms ease-in-out`
            : `transform 240ms cubic-bezier(0.16, 1, 0.3, 1), opacity ${opacityDuration}ms ease-in-out`,
      }}
      onPointerEnter={() => {
        setIsHoveredOrb(true);
        wake();
      }}
      onPointerLeave={() => setIsHoveredOrb(false)}
      onFocus={() => wake()}
      onWheel={handleWheelRing}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Ambient Radial Aura Behind Closed Orb / Open Ring */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute rounded-full transition-all duration-300 ${
          settings.reduceMotion ? '' : 'animate-orb-breathe'
        }`}
        style={{
          width: isOpen ? `${adaptiveLayout.effectiveRadius * 2 + 102}px` : '168px',
          height: isOpen ? `${adaptiveLayout.effectiveRadius * 2 + 102}px` : '168px',
          opacity: intensity,
          background: `radial-gradient(circle, ${palette.primary} 0%, ${palette.secondary} 36%, transparent 72%)`,
          filter: 'blur(20px)',
        }}
      />

      {/* Luminous Expanding Orbital Ring */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="radial-orbit-ring"
            initial={{ opacity: 0, scale: 0.56 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.56 }}
            transition={transitionSpring}
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            {/* Outer Luminous Halo Ring */}
            <div
              className={`absolute rounded-full ${
                settings.reduceMotion ? '' : 'animate-ring-slow'
              }`}
              style={{
                width: `${adaptiveLayout.effectiveRadius * 2 + 12}px`,
                height: `${adaptiveLayout.effectiveRadius * 2 + 12}px`,
                border: `1.5px solid ${palette.ringStroke}`,
                boxShadow: `0 0 36px ${palette.secondary}, inset 0 0 28px ${palette.secondary}`,
                background: `radial-gradient(circle, transparent 58%, ${palette.secondary.replace(
                  /[\d.]+\)$/,
                  '0.12)'
                )} 72%, transparent 76%)`,
              }}
            />

            {/* Secondary Dashed Precision Accent Ring */}
            <div
              className={`absolute rounded-full ${
                settings.reduceMotion ? '' : 'animate-ring-reverse'
              }`}
              style={{
                width: `${adaptiveLayout.effectiveRadius * 2 - 22}px`,
                height: `${adaptiveLayout.effectiveRadius * 2 - 22}px`,
                border: `1px dashed ${palette.ringStroke}`,
                opacity: 0.45,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Software Icon Nodes Placed Geometrically Around the Ring */}
      <AnimatePresence>
        {isOpen &&
          pageShortcuts.map((shortcut, index) => {
            const count = pageShortcuts.length;
            const angleDeg = -90 + (360 / count) * index;
            const angleRad = (angleDeg * Math.PI) / 180;
            const tx = Math.cos(angleRad) * adaptiveLayout.effectiveRadius;
            const ty = Math.sin(angleRad) * adaptiveLayout.effectiveRadius;
            const isHovered = hoveredId === shortcut.id;
            const tooltipSide = getAdaptiveTooltipSide(tx, ty, adaptiveLayout.effectiveRadius);

            const tooltipPositionClass =
              tooltipSide === 'bottom'
                ? 'top-full mt-2'
                : tooltipSide === 'left'
                  ? 'right-full mr-2 top-1/2 -translate-y-1/2'
                  : tooltipSide === 'right'
                    ? 'left-full ml-2 top-1/2 -translate-y-1/2'
                    : 'bottom-full mb-2';

            return (
              <motion.div
                key={`${page}-${shortcut.id}`}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0.35 }}
                animate={{ opacity: 1, x: tx, y: ty, scale: 1 }}
                exit={{ opacity: 0, x: 0, y: 0, scale: 0.35 }}
                transition={
                  settings.reduceMotion
                    ? { duration: 0.01 }
                    : {
                        type: 'spring',
                        stiffness: 340,
                        damping: 24,
                        delay: index * 0.025,
                      }
                }
                className="absolute z-20 flex items-center justify-center"
                style={{
                  width: `${adaptiveLayout.nodeSize}px`,
                  height: `${adaptiveLayout.nodeSize}px`,
                }}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLaunch(shortcut);
                    onCloseRing();
                  }}
                  onMouseEnter={() => setHoveredId(shortcut.id)}
                  onMouseLeave={() => setHoveredId((prev) => (prev === shortcut.id ? null : prev))}
                  onFocus={() => setHoveredId(shortcut.id)}
                  onBlur={() => setHoveredId((prev) => (prev === shortcut.id ? null : prev))}
                  aria-label={shortcut.name}
                  className="acrylic-node w-full h-full rounded-full flex items-center justify-center text-[#F5FAFF] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#65D5FF]"
                >
                  <AppIcon iconKey={shortcut.iconKey} className={adaptiveLayout.iconClass} />
                </button>

                {/* Minimal Hover Tooltip — Positioned Inward Away From Screen Edges */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.94 }}
                      transition={{ duration: 0.14 }}
                      className={`acrylic-tooltip pointer-events-none absolute z-30 px-3 py-1 rounded-full whitespace-nowrap text-[12px] font-medium text-[#F5FAFF] ${tooltipPositionClass}`}
                    >
                      {shortcut.name}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
      </AnimatePresence>

      {/* Central Floating Glassmorphic 59 Orb */}
      <div className="relative z-30 group flex items-center justify-center">
        <button
          type="button"
          onPointerDown={handleOrbPointerDown}
          onPointerMove={handleOrbPointerMove}
          onPointerUp={handleOrbPointerUp}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            wake();
            onOpenSettings();
          }}
          aria-expanded={isOpen}
          aria-label={
            isOpen ? 'بستن حلقه برنامه‌های LAUNCHER 59' : 'باز کردن لانچر دایره‌ای ۵۹'
          }
          className={`acrylic-orb relative w-[116px] h-[116px] rounded-full flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#65D5FF] transition-transform duration-200 ${
            isDragging
              ? 'cursor-grabbing scale-[0.97]'
              : 'cursor-pointer hover:scale-[1.03] active:scale-[0.97]'
          }`}
          style={{
            border: `1.5px solid ${isOpen ? palette.border : 'rgba(185, 221, 255, 0.34)'}`,
            boxShadow: isOpen
              ? `0 0 38px ${palette.primary}, 0 14px 40px -6px rgba(2, 12, 28, 0.78), inset 0 1.5px 1px rgba(245, 250, 255, 0.45)`
              : `0 0 24px ${palette.secondary}, 0 14px 36px -6px rgba(2, 12, 28, 0.72), inset 0 1.5px 1px rgba(245, 250, 255, 0.38)`,
          }}
        >
          {/* Subtle Inner Optical Rim */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-[6px] rounded-full border border-white/15"
          />

          {/* Dominant Optical Number 59 */}
          <span
            dir="ltr"
            className="font-display font-bold text-[50px] leading-none tracking-[-0.04em] number-59-glass select-none"
          >
            59
          </span>
        </button>

        {/* Discreet Gear Button (Visible on Orb Hover / Focus / Open Ring) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            wake();
            onOpenSettings();
          }}
          aria-label="مدیریت و تنظیمات لانچر ۵۹"
          title="تنظیمات و مدیریت برنامه‌ها"
          className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full acrylic-node flex items-center justify-center text-[#B9DDFF] hover:text-[#F5FAFF] cursor-pointer transition-opacity duration-200 focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[#65D5FF] ${
            isOpen
              ? 'opacity-85 hover:opacity-100'
              : 'opacity-0 group-hover:opacity-90 hover:!opacity-100'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        {/* Compact Ring Pagination Pill (Only when > 8 Apps and Ring is Open) */}
        <AnimatePresence>
          {isOpen && totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16 }}
              className="absolute -bottom-9 flex items-center gap-1 px-2 py-0.5 rounded-full acrylic-tooltip text-[11px] text-[#B9DDFF]"
              dir="ltr"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPage((p) => (p - 1 + totalPages) % totalPages);
                }}
                aria-label="صفحه قبلی حلقه"
                className="p-0.5 rounded-full hover:text-[#F5FAFF] hover:bg-white/10 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono-tabular px-1 text-[10px]">
                {toDisplayDigits(page + 1, settings.usePersianDigits)}/
                {toDisplayDigits(totalPages, settings.usePersianDigits)}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPage((p) => (p + 1) % totalPages);
                }}
                aria-label="صفحه بعدی حلقه"
                className="p-0.5 rounded-full hover:text-[#F5FAFF] hover:bg-white/10 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
