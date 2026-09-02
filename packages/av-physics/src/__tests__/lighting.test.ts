import { describe, it, expect } from 'vitest';
import { calculatePointSourceIlluminance, calculateFootprintDiameter, calculateIlluminanceComponents, calculateCCTMcCamy } from '../lighting';

describe('Lighting Physics', () => {
  it('calculates point-source illuminance (inverse square law)', () => {
    // 1000 cd at 2 meters = 1000 / 4 = 250 lux
    expect(calculatePointSourceIlluminance(1000, 2)).toBe(250);
  });

  it('calculates beam footprint diameter', () => {
    // 5m distance, 30 degree beam angle -> 2 * 5 * tan(15 deg) = 10 * 0.2679 = 2.679m
    expect(calculateFootprintDiameter(5, 30)).toBeCloseTo(2.679, 3);
  });

  it('calculates horizontal and vertical illuminance components', () => {
    // Normal illuminance 500 lux, 45 degree incidence
    // cos(45) = sin(45) = 0.7071
    const [horiz, vert] = calculateIlluminanceComponents(500, 45);
    expect(horiz).toBeCloseTo(353.55, 2);
    expect(vert).toBeCloseTo(353.55, 2);
  });

  it('calculates Correlated Color Temperature (CCT) using McCamy formula', () => {
    // CIE 1931 x=0.3127, y=0.3290 is standard illuminant D65 (approx 6500K)
    // McCamy formula is an approximation, usually within a few percent
    expect(calculateCCTMcCamy(0.3127, 0.3290)).toBeCloseTo(6505, -1);
  });
});
