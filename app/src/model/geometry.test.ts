import { describe, expect, it } from 'vitest';
import * as geometry from './geometry';

describe('geometry ratchet', () => {
  it('programmatically verifies every numeric export is a multiple of PITCH or in NON_GRID_EXPORTS', () => {
    const entries = Object.entries(geometry);
    const numericExports = entries.filter(([, value]) => typeof value === 'number');

    expect(numericExports.length).toBeGreaterThan(0);

    for (const [name, value] of numericExports) {
      const isAllowedNonGrid = (geometry.NON_GRID_EXPORTS as readonly string[]).includes(name);
      const isMultipleOfPitch = (value as number) % geometry.PITCH === 0;

      expect(
        isMultipleOfPitch || isAllowedNonGrid,
        `Export "${name}" with value ${value} must be a multiple of PITCH (${geometry.PITCH}) or listed in NON_GRID_EXPORTS`
      ).toBe(true);
    }
  });

  it('NON_GRID_EXPORTS ships with exactly one entry: PORT_DOT_INSET', () => {
    expect(geometry.NON_GRID_EXPORTS).toEqual(['PORT_DOT_INSET']);
  });

  it('enforces PORT_ROW_H === 2 * PITCH', () => {
    expect(geometry.PORT_ROW_H).toBe(2 * geometry.PITCH);
  });

  it('enforces the first-port-center invariant (CARD_HEADER_H + CARD_PAD_Y + PORT_ROW_H / 2 is a multiple of PITCH)', () => {
    const firstPortCenterOffset =
      geometry.CARD_HEADER_H + geometry.CARD_PAD_Y + geometry.PORT_ROW_H / 2;
    expect(firstPortCenterOffset % geometry.PITCH).toBe(0);
  });

  it('portDotPosition returns coordinates that are multiples of PITCH for indices 0-7 on both sides', () => {
    const cardX = 0;
    const cardY = 0;
    const sides: geometry.PortSide[] = ['left', 'right'];

    for (const side of sides) {
      for (let portIndex = 0; portIndex < 8; portIndex++) {
        const pos = geometry.portDotPosition(cardX, cardY, portIndex, side);
        expect(
          pos.x % geometry.PITCH,
          `portDotPosition x coordinate (${pos.x}) at index ${portIndex} on ${side} side must be a multiple of PITCH`
        ).toBe(0);
        expect(
          pos.y % geometry.PITCH,
          `portDotPosition y coordinate (${pos.y}) at index ${portIndex} on ${side} side must be a multiple of PITCH`
        ).toBe(0);
      }
    }
  });

  it('portDotPosition places left ports at cardX and right ports at cardX + CARD_WIDTH with correct y offsets', () => {
    const cardX = 48;
    const cardY = 96;

    const left0 = geometry.portDotPosition(cardX, cardY, 0, 'left');
    expect(left0.x).toBe(cardX);
    expect(left0.y).toBe(
      cardY + geometry.CARD_HEADER_H + geometry.CARD_PAD_Y + geometry.PORT_ROW_H / 2
    );

    const right3 = geometry.portDotPosition(cardX, cardY, 3, 'right');
    expect(right3.x).toBe(cardX + geometry.CARD_WIDTH);
    expect(right3.y).toBe(
      cardY +
        geometry.CARD_HEADER_H +
        geometry.CARD_PAD_Y +
        geometry.PORT_ROW_H / 2 +
        3 * geometry.PORT_ROW_H
    );
  });
});
