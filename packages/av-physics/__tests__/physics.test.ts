import { describe, it, expect } from 'vitest';
import { calculateBDMMaxDistance, calculateFOV, calculateThrowDistance } from '../src';

describe('AV Physics', () => {
  it('DISCAS BDM max distance is 6x height', () => {
    expect(calculateBDMMaxDistance(1.5)).toBe(9.0);
  });

  it('Camera FOV calculations', () => {
    // 35mm full frame sensor width = 36mm, 50mm lens -> ~39.6 degrees
    const fov = calculateFOV(36, 50);
    expect(fov).toBeCloseTo(39.597, 2);
  });

  it('Projector Throw distance', () => {
    const [min, max] = calculateThrowDistance(2, 1.5, 2.0);
    expect(min).toBe(3.0);
    expect(max).toBe(4.0);
  });
});
