import { AppearanceSettings, PositionPreset, RingSize } from '../types/launcher';

export interface WorkAreaRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RingGeometrySpec {
  baseRadius: number;
  nodeSize: number;
  iconClass: string;
  orbDiameter: number;
}

export const RING_GEOMETRY_SPECS: Record<RingSize, RingGeometrySpec> = {
  small: { baseRadius: 122, nodeSize: 48, iconClass: 'w-5 h-5', orbDiameter: 42 },
  medium: { baseRadius: 150, nodeSize: 54, iconClass: 'w-[24px] h-[24px]', orbDiameter: 42 },
  large: { baseRadius: 180, nodeSize: 60, iconClass: 'w-7 h-7', orbDiameter: 42 },
};

export interface AdaptiveRadialLayout {
  effectiveRadius: number;
  stageSize: number;
  nodeSize: number;
  iconSizePx: number;
  iconClass: string;
  /** Temporary shift in px applied when open so full halo stays inside visible workArea */
  openShiftX: number;
  openShiftY: number;
  /** Compactness factor applied only when viewport space is very tight */
  compacted: boolean;
}

/**
 * Computes an adaptive radial layout given the orb's resting center inside a display workArea.
 * Supports v2.1.0 appearance overrides (custom radius, icon node size, spacing multiplier)
 * while keeping radial menu icons full-sized regardless of compact closed orb diameter.
 */
export function computeAdaptiveRadialLayout(params: {
  orbCenterX: number;
  orbCenterY: number;
  workArea: WorkAreaRect;
  ringSize: RingSize;
  appearance?: AppearanceSettings;
}): AdaptiveRadialLayout {
  const { orbCenterX, orbCenterY, workArea, ringSize, appearance } = params;
  const spec = RING_GEOMETRY_SPECS[ringSize];

  const nodeSize = appearance ? appearance.radialIconSize : spec.nodeSize;
  const spacingMultiplier = appearance ? appearance.radialIconSpacing : 1.0;
  const requestedRadius = Math.round(
    (appearance ? appearance.radialRadius : spec.baseRadius) * spacingMultiplier
  );

  // Extra margin guarantees glow & hover lift never clip against transparent window boundaries
  const edgeMargin = 28;
  const minClearRadius = Math.max(96, Math.round(requestedRadius * 0.82));
  const maxFitRadius = Math.floor(
    Math.min(workArea.width, workArea.height) / 2 - nodeSize / 2 - edgeMargin
  );

  const effectiveRadius = Math.max(
    minClearRadius,
    Math.min(requestedRadius, maxFitRadius)
  );
  const compacted = effectiveRadius < requestedRadius;

  const requiredHalfSpan = effectiveRadius + nodeSize / 2 + edgeMargin;
  const stageSize = Math.ceil(requiredHalfSpan * 2);

  const minCenterX = workArea.x + requiredHalfSpan;
  const maxCenterX = workArea.x + workArea.width - requiredHalfSpan;
  const minCenterY = workArea.y + requiredHalfSpan;
  const maxCenterY = workArea.y + workArea.height - requiredHalfSpan;

  const clampedCenterX =
    minCenterX <= maxCenterX
      ? Math.max(minCenterX, Math.min(maxCenterX, orbCenterX))
      : workArea.x + workArea.width / 2;

  const clampedCenterY =
    minCenterY <= maxCenterY
      ? Math.max(minCenterY, Math.min(maxCenterY, orbCenterY))
      : workArea.y + workArea.height / 2;

  const iconScale = appearance ? appearance.iconImageScale : 0.72;
  const iconSizePx = Math.max(18, Math.round(nodeSize * iconScale));

  return {
    effectiveRadius,
    stageSize,
    nodeSize,
    iconSizePx,
    iconClass: spec.iconClass,
    openShiftX: Math.round(clampedCenterX - orbCenterX),
    openShiftY: Math.round(clampedCenterY - orbCenterY),
    compacted,
  };
}

/**
 * Computes tooltip placement relative to a ring icon node so tooltips do not clip screen edges.
 */
export function getAdaptiveTooltipSide(
  nodeOffsetX: number,
  nodeOffsetY: number,
  radius: number
): 'top' | 'bottom' | 'left' | 'right' {
  if (nodeOffsetY < -radius * 0.48) return 'bottom';
  if (nodeOffsetY > radius * 0.48) return 'top';
  if (nodeOffsetX < -radius * 0.65) return 'right';
  if (nodeOffsetX > radius * 0.65) return 'left';
  return 'top';
}

/**
 * Computes web preview resting offset (relative to viewport center) for all 9 position presets.
 */
export function getWebPresetOffset(preset: PositionPreset): { x: number; y: number } {
  if (typeof window === 'undefined' || preset === 'center') {
    return { x: 0, y: 0 };
  }
  const margin = 84;
  const halfW = Math.max(60, Math.round(window.innerWidth / 2 - margin));
  const halfH = Math.max(60, Math.round(window.innerHeight / 2 - margin));

  switch (preset) {
    case 'top':
      return { x: 0, y: -halfH };
    case 'bottom-center':
      return { x: 0, y: halfH };
    case 'left':
      return { x: -halfW, y: 0 };
    case 'right':
      return { x: halfW, y: 0 };
    case 'top-left':
      return { x: -halfW, y: -halfH };
    case 'top-right':
      return { x: halfW, y: -halfH };
    case 'bottom-left':
      return { x: -halfW, y: halfH };
    case 'bottom-right':
      return { x: halfW, y: halfH };
    default:
      return { x: 0, y: 0 };
  }
}

export function clampWebOrbOffset(offset: { x: number; y: number }): { x: number; y: number } {
  if (typeof window === 'undefined') return offset;
  const margin = 76;
  const halfW = Math.max(60, window.innerWidth / 2 - margin);
  const halfH = Math.max(60, window.innerHeight / 2 - margin);
  return {
    x: Math.round(Math.max(-halfW, Math.min(halfW, offset.x))),
    y: Math.round(Math.max(-halfH, Math.min(halfH, offset.y))),
  };
}
