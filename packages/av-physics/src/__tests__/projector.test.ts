import { describe, it, expect } from 'vitest';
import { calculateThrowDistance, calculateLuminance, calculateProjectedWidth, isWithinLensShiftEnvelope, calculateOffsetAngle } from '../projector';

describe('Projector Physics', () => {
  it('calculates throw distance range', () => {
    // 2m width, 1.5 - 2.0 TR => 3.0m - 4.0m
    const [min, max] = calculateThrowDistance(2, 1.5, 2.0);
    expect(min).toBeCloseTo(3.0, 2);
    expect(max).toBeCloseTo(4.0, 2);
  });

  it('calculates screen luminance (nits) from lumens', () => {
    // 5000 lumens, 5 sqm area, 1.2 gain => E = 1000 lux. L = 1000 * 1.2 / PI = 381.97 nits
    expect(calculateLuminance(5000, 5, 1.2)).toBeCloseTo(381.97, 2);
  });

  it('calculates projected width from distance and throw ratio', () => {
    // 4.0m distance, 2.0 TR => 2.0m width
    expect(calculateProjectedWidth(4.0, 2.0)).toBeCloseTo(2.0, 2);
  });

  it('validates lens shift envelope (elliptical boundary)', () => {
    // Max shifts: 20% horizontal, 50% vertical
    // Inside envelope: (0.1/0.2)^2 + (0.2/0.5)^2 = 0.25 + 0.16 = 0.41 <= 1.0 -> true
    expect(isWithinLensShiftEnvelope(0.1, 0.2, 0.2, 0.5)).toBe(true);
    // On boundary: (0.2/0.2)^2 + (0/0.5)^2 = 1.0 <= 1.0 -> true
    expect(isWithinLensShiftEnvelope(0.2, 0.0, 0.2, 0.5)).toBe(true);
    // Outside envelope: (0.2/0.2)^2 + (0.5/0.5)^2 = 2.0 > 1.0 -> false
    expect(isWithinLensShiftEnvelope(0.2, 0.5, 0.2, 0.5)).toBe(false);
  });

  it('calculates projector offset angle', () => {
    // distance = 4m, offset = 2m -> atan(2/4) = 26.565 degrees
    expect(calculateOffsetAngle(4.0, 2.0)).toBeCloseTo(26.565, 3);
  });
});
