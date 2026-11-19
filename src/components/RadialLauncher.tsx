import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { useIdleFade } from '../hooks/useIdleFade';
import { AppShortcut, LauncherSettings } from '../types/launcher';
import {
  computeOrbMetrics,
  computeVisualStyles,
  hexToRgba,
  resolveAppearance,
} from '../utils/appearanceConfig';
import { toDisplayDigits } from '../utils/formatters';
import {
  IconLibraryMap,
  resolveBrandIconKeyForShortcut,
} from '../utils/iconLibrary';
import {
  AdaptiveRadialLayout,
  clampWebOrbOffset,
  getAdaptiveTooltipSide,
} from '../utils/radialPlacement';
import { AppIcon } from './icons/AppIcon';

interface RadialLauncherProps {
  shortcuts: AppShortcut[];
  settings: LauncherSettings;
  iconLibrary: IconLibraryMap;
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

export const RadialLauncher: React.FC<RadialLauncherProps> = ({
  shortcuts,
  settings,
  iconLibrary,
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
  const uid = useId().replace(/:/g, '');
  const [page, setPage] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHoveredOrb, setIsHoveredOrb] = useState(false);

  const appearance = useMemo(() => resolveAppearance(settings), [settings]);
  const orbMetrics = useMemo(
    () => computeOrbMetrics(appearance, isOpen),
    [appearance, isOpen]
  );
  const visuals = useMemo(
    () => computeVisualStyles(appearance, settings.haloIntensity, isOpen),
    [appearance, settings.haloIntensity, isOpen]
  );

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
    : { type: 'spring' as const, stiffness: 320, damping: 25, mass: 0.78 };

  const stagePx = isOpen ? adaptiveLayout.stageSize : orbMetrics.closedStagePx;
  const webShiftX = orbOffset.x + (isOpen ? adaptiveLayout.openShiftX : 0);
  const webShiftY = orbOffset.y + (isOpen ? adaptiveLayout.openShiftY : 0);
  const opacityDuration = settings.reduceMotion ? 0 : isIdle ? 520 : 220;
  const combinedOpacity = isOpen
    ? appearance.globalOpacity
    : Math.max(0.12, effectiveOpacity * appearance.globalOpacity);

  // Strictly contain soft ambient glow well inside stagePx so zero edge clipping or square shadow can ever occur
  const closedAuraDiameter = Math.min(stagePx - 28, Math.round(orbMetrics.closedDiameter + 44));
  const openAuraDiameter = Math.min(stagePx - 16, Math.round(adaptiveLayout.effectiveRadius * 2 + 54));
  const auraDiameter = isOpen ? openAuraDiameter : closedAuraDiameter;

  // Seamless SVG orbital ring sizing
  const outerRingDiameter = adaptiveLayout.effectiveRadius * 2 + 16;
  const orbRingDiameter = orbMetrics.activeDiameter + Math.max(8, Math.round(orbMetrics.activeDiameter * 0.18));
  const compactOrb = orbMetrics.activeDiameter <= 56;
  const gearSizePx = compactOrb ? 22 : 28;
  const gearOffset = compactOrb ? -7 : -3;

  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{
        width: `${stagePx}px`,
        height: `${stagePx}px`,
        opacity: combinedOpacity,
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
      {/* Calibrated Ambient Radial Aura — Fades to 0% well inside window edge (Zero Square Box Clip) */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute rounded-full transition-all duration-300 ${
          settings.reduceMotion ? '' : 'animate-orb-breathe'
        }`}
        style={{
          width: `${auraDiameter}px`,
          height: `${auraDiameter}px`,
          background: visuals.auraBackground,
          filter: `blur(${Math.min(18, Math.round(orbMetrics.activeDiameter * 0.28 + 6))}px)`,
        }}
      />

      {/* Seamless 360° SVG Luminous Orbital Ring (Zero Cut / Zero Seam Artifact) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="radial-orbit-ring"
            initial={{ opacity: 0, scale: 0.54 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.54 }}
            transition={transitionSpring}
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <svg
              width={outerRingDiameter + 18}
              height={outerRingDiameter + 18}
              viewBox="0 0 240 240"
              className={`absolute overflow-visible ${settings.reduceMotion ? '' : 'animate-ring-slow'}`}
              aria-hidden="true"
            >
              <defs>
                {/* Periodic smooth gradient (start == end) guarantees zero visible seam during 360° rotation */}
                <linearGradient id={`orbitGrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={visuals.ringPrimaryStop} stopOpacity="0.95" />
                  <stop offset="33%" stopColor={visuals.ringAccentStop} stopOpacity="0.55" />
                  <stop offset="66%" stopColor={visuals.ringPrimaryStop} stopOpacity="0.92" />
                  <stop offset="100%" stopColor={visuals.ringAccentStop} stopOpacity="0.55" />
                </linearGradient>
                <filter id={`orbitGlow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {/* Soft outer halo track */}
              <circle
                cx="120"
                cy="120"
                r="108"
                fill="none"
                stroke={hexToRgba(appearance.ringColor, 0.22)}
                strokeWidth="4.5"
              />
              {/* Seamless primary luminous ring */}
              <circle
                cx="120"
                cy="120"
                r="108"
                fill="none"
                stroke={`url(#orbitGrad-${uid})`}
                strokeWidth="1.8"
                filter={`url(#orbitGlow-${uid})`}
              />
              {/* Precision inner hair-ring */}
              <circle
                cx="120"
                cy="120"
                r="92"
                fill="none"
                stroke={hexToRgba(appearance.ringColor, 0.28)}
                strokeWidth="0.9"
                strokeDasharray="3 6"
                strokeLinecap="round"
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Software Icon Nodes Placed Geometrically Around the Ring (Full-Size & Independent of Compact Orb) */}
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

            const libEntry = iconLibrary[shortcut.id];
            const activeIconDataUrl = libEntry?.activeDataUrl || shortcut.customIconDataUrl;
            const brandKey =
              libEntry?.brandIconKey || resolveBrandIconKeyForShortcut(shortcut);

            return (
              <motion.div
                key={`${page}-${shortcut.id}`}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0.32 }}
                animate={{ opacity: 1, x: tx, y: ty, scale: 1 }}
                exit={{ opacity: 0, x: 0, y: 0, scale: 0.32 }}
                transition={
                  settings.reduceMotion
                    ? { duration: 0.01 }
                    : {
                        type: 'spring',
                        stiffness: 340,
                        damping: 24,
                        delay: index * 0.022,
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
                  className="acrylic-node-v2 w-full h-full flex items-center justify-center text-[#F5FAFF] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#76E4FF]"
                  style={{
                    ...visuals.nodeStyle,
                    borderColor: isHovered ? visuals.ringPrimaryStop : undefined,
                    boxShadow: isHovered
                      ? `0 12px 28px -4px ${hexToRgba(appearance.primaryColor, 0.6)}, 0 0 20px ${hexToRgba(appearance.ringColor, 0.5)}, inset 0 1px 1px rgba(255, 255, 255, 0.55)`
                      : visuals.nodeStyle.boxShadow,
                  }}
                >
                  <AppIcon
                    iconKey={shortcut.iconKey}
                    customIconDataUrl={activeIconDataUrl}
                    brandIconKey={brandKey}
                    appName={shortcut.englishName || shortcut.name}
                    className="shrink-0"
                    style={{
                      width: `${adaptiveLayout.iconSizePx}px`,
                      height: `${adaptiveLayout.iconSizePx}px`,
                    }}
                  />
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

      {/* Central Floating Fluent 3D Glassmorphic 59 Orb */}
      <div className="relative z-30 group flex items-center justify-center">
        {/* Seamless Continuous 360° SVG Luminous Halo Rim Around the Orb */}
        <svg
          width={orbRingDiameter}
          height={orbRingDiameter}
          viewBox="0 0 100 100"
          aria-hidden="true"
          className={`pointer-events-none absolute overflow-visible ${
            settings.reduceMotion ? '' : 'animate-ring-slow'
          }`}
          style={{
            transition: settings.reduceMotion
              ? 'none'
              : 'width 240ms cubic-bezier(0.16, 1, 0.3, 1), height 240ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <defs>
            <linearGradient id={`orbRim-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.92" />
              <stop offset="28%" stopColor={visuals.ringPrimaryStop} stopOpacity="0.95" />
              <stop offset="64%" stopColor={visuals.ringAccentStop} stopOpacity="0.72" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.92" />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke={`url(#orbRim-${uid})`}
            strokeWidth={orbMetrics.activeDiameter <= 48 ? '2.4' : '1.9'}
            style={{
              filter: `drop-shadow(0 0 4px ${visuals.ringGlowColor})`,
            }}
          />
        </svg>

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
          className={`relative rounded-full overflow-hidden flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#76E4FF] ${
            isDragging
              ? 'cursor-grabbing scale-[0.95]'
              : 'cursor-pointer hover:scale-[1.06] active:scale-[0.95]'
          }`}
          style={{
            width: `${orbMetrics.activeDiameter}px`,
            height: `${orbMetrics.activeDiameter}px`,
            background: visuals.orbBackground,
            backdropFilter: visuals.orbBackdropFilter,
            WebkitBackdropFilter: visuals.orbBackdropFilter,
            border: `1.25px solid ${hexToRgba(appearance.ringColor, isOpen ? 0.78 : 0.56)}`,
            boxShadow: visuals.orbBoxShadow,
            transition: settings.reduceMotion
              ? 'none'
              : 'width 240ms cubic-bezier(0.16, 1, 0.3, 1), height 240ms cubic-bezier(0.16, 1, 0.3, 1), transform 180ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 220ms ease',
          }}
        >
          {/* Top-left 3D Specular Glass Reflection */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-[2px] rounded-full"
            style={{
              background: visuals.specularBackground,
              maskImage: 'radial-gradient(ellipse 85% 58% at 38% 18%, black 0%, transparent 72%)',
              WebkitMaskImage:
                'radial-gradient(ellipse 85% 58% at 38% 18%, black 0%, transparent 72%)',
            }}
          />

          {/* Bottom Caustic Light Bounce */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              background: visuals.bottomBounceBackground,
            }}
          />

          {/* Crisp Inner Optical Rim */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-[3px] rounded-full"
            style={{
              border: '1px solid rgba(255, 255, 255, 0.24)',
            }}
          />

          {/* Razor-Sharp Optical Number 59 — Crisp at 42px through 128px */}
          <span
            dir="ltr"
            className="relative z-10 font-display font-bold leading-none tracking-[-0.04em] number-59-glass-v2 select-none"
            style={{
              fontSize: `${orbMetrics.fontSizePx}px`,
              transition: settings.reduceMotion
                ? 'none'
                : 'font-size 220ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            59
          </span>
        </button>

        {/* Discreet Gear Button — Scaled & Offset Cleanly so 59 is Never Covered */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            wake();
            onOpenSettings();
          }}
          aria-label="مدیریت و تنظیمات لانچر ۵۹"
          title="تنظیمات و مدیریت برنامه‌ها"
          style={{
            width: `${gearSizePx}px`,
            height: `${gearSizePx}px`,
            bottom: `${gearOffset}px`,
            right: `${gearOffset}px`,
          }}
          className={`absolute rounded-full acrylic-node-v2 flex items-center justify-center text-[#D8F0FF] hover:text-white cursor-pointer transition-opacity duration-200 focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[#76E4FF] ${
            isOpen
              ? 'opacity-90 hover:opacity-100'
              : 'opacity-0 group-hover:opacity-95 hover:!opacity-100'
          }`}
        >
          <Settings style={{ width: compactOrb ? '11px' : '14px', height: compactOrb ? '11px' : '14px' }} />
        </button>

        {/* Compact Ring Pagination Control (Only when > 8 Apps and Ring is Open) */}
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
