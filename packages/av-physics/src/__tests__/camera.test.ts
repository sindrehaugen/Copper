import { describe, it, expect } from 'vitest';
import { calculateFOV, calculateCoverageDimension, calculatePixelDensityAtDistance } from '../camera';

describe('Camera Physics', () => {
  it('calculates FOV in degrees', () => {
    // 35mm full frame sensor width = 36mm, 50mm lens -> HFOV ≈ 39.597 degrees
    expect(calculateFOV(36, 50)).toBeCloseTo(39.598, 3);
  });

  it('calculates coverage dimension at distance', () => {
    // Distance = 10m, FOV = 40 degrees
    // coverage = 2 * 10 * tan(20 degrees) = 20 * 0.36397 = 7.279m
    expect(calculateCoverageDimension(10, 40)).toBeCloseTo(7.279, 3);
  });

  it('calculates pixel density at distance', () => {
    // Distance = 10m, FOV = 40 degrees (coverage ~ 7.279m), resolution = 1920
    // density = 1920 / 7.279 = 263.758 px/m
    expect(calculatePixelDensityAtDistance(10, 40, 1920)).toBeCloseTo(263.758, 3);
  });
});
