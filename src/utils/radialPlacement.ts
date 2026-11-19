import { PositionPreset, RingSize } from '../types/launcher';

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
  small: { baseRadius: 122, nodeSize: 48, iconClass: 'w-5 h-5', orbDiameter: 116 },
  medium: { baseRadius: 150, nodeSize: 54, iconClass: 'w-[22px] h-[22px]', orbDiameter: 116 },
  large: { baseRadius: 180, nodeSize: 58, iconClass: 'w-6 h-6', orbDiameter: 116 },
};

export interface AdaptiveRadialLayout {
  effectiveRadius: number;
  stageSize: number;
  nodeSize: number;
  iconClass: string;
  /** Temporary shift in px applied when open so full halo stays inside visible workArea */
  openShiftX: number;
  openShiftY: number;
  /** Compactness factor 0.8..1 applied only when viewport space is very tight */
  compacted: boolean;
}

/**
 * Computes an adaptive radial layout given the orb's resting center inside a display workArea.
 * Ensures the entire halo, icon nodes, and edge margin remain completely visible inside workArea
 * without permanently changing the user's saved orb position.
 */
export function computeAdaptiveRadialLayout(params: {
  orbCenterX: number;
  orbCenterY: number;
  workArea: WorkAreaRect;
  ringSize: RingSize;
}): AdaptiveRadialLayout {
  const { orbCenterX, orbCenterY, workArea, ringSize } = params;
  const spec = RING_GEOMETRY_SPECS[ringSize];

  const edgeMargin = 18;
  const minClearRadius = Math.max(104, Math.round(spec.baseRadius * 0.84));
  const maxFitRadius = Math.floor(
    Math.min(workArea.width, workArea.height) / 2 - spec.nodeSize / 2 - edgeMargin
  );

  const effectiveRadius = Math.max(
    minClearRadius,
    Math.min(spec.baseRadius, maxFitRadius)
  );
  const compacted = effectiveRadius < spec.baseRadius;

  const requiredHalfSpan = effectiveRadius + spec.nodeSize / 2 + edgeMargin;
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

  return {
    effectiveRadius,
    stageSize,
    nodeSize: spec.nodeSize,
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
