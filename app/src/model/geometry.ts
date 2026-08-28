// Invariant: fundamental grid unit in pixels; all card dimensions and port positions must be integer multiples of this to guarantee grid alignment.
export const PITCH = 24;

// Invariant: must be an integer multiple of PITCH so right-side ports land on grid lines.
export const CARD_WIDTH = 240;

// Invariant: must be an integer multiple of PITCH to preserve vertical grid alignment.
export const CARD_HEADER_H = 48;

// Invariant: must be an integer multiple of PITCH to preserve vertical grid alignment.
export const CARD_PAD_Y = 0;

// Invariant: must be 2 * PITCH so half-row port dot centering (PORT_ROW_H / 2) produces an integer multiple of PITCH.
export const PORT_ROW_H = 2 * PITCH;

// Invariant: canonical sub-pitch distance from card edge to port dot center used identically by all renderers.
export const PORT_DOT_INSET = 8;

// Invariant: allowlist of exported numeric constants permitted to be non-multiples of PITCH.
export const NON_GRID_EXPORTS = ['PORT_DOT_INSET'] as const;

export type PortSide = 'left' | 'right';

export interface Point {
  readonly x: number;
  readonly y: number;
}

/**
 * Returns grid-aligned coordinates (the dot center, before inset rendering)
 * for a port at the specified index on the given side of a card.
 */
export function portDotPosition(
  cardX: number,
  cardY: number,
  portIndex: number,
  side: PortSide
): Point {
  const x = side === 'left' ? cardX : cardX + CARD_WIDTH;
  const firstPortCenterY = cardY + CARD_HEADER_H + CARD_PAD_Y + PORT_ROW_H / 2;
  const y = firstPortCenterY + portIndex * PORT_ROW_H;
  return { x, y };
}
