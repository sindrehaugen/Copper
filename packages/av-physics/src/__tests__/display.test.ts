import { describe, it, expect } from 'vitest';
import { calculateBDMMaxDistance, calculateADMMaxDistance, calculateISCR, isWithinViewingAngleLimits, calculatePixelPitchMinDistance } from '../display';

describe('Display (DISCAS) Physics', () => {
  it('calculates BDM Max Distance (6x rule)', () => {
    // 1.5m height * 6 = 9.0m
    expect(calculateBDMMaxDistance(1.5)).toBeCloseTo(9.0, 2);
  });

  it('calculates ADM Max Distance (Standard 200 viewing factor)', () => {
    // AVIXA ADM: distance = (height * %factor) / element%. 
    // Example: 2m image, 2% element size, factor 200 => 200m
    expect(calculateADMMaxDistance(2, 2, 200)).toBeCloseTo(200.0, 2);
    // 1.5m image, 1% element size => 300m
    expect(calculateADMMaxDistance(1.5, 1, 200)).toBeCloseTo(300.0, 2);
  });

  it('calculates ISCR correctly with ambient lux to nits conversion', () => {
    // Image 500 nits, Black 1 nit, Ambient 150 lux on 1.0 gain screen.
    // ambient luminance = 150 / PI ≈ 47.746 nits
    // ISCR = (500 + 47.746) / (1 + 47.746) = 547.746 / 48.746 ≈ 11.2366
    expect(calculateISCR(500, 1, 150, 1.0)).toBeCloseTo(11.237, 3);
  });

  it('checks viewing angle limits', () => {
    // +/- 60 horizontal, +15/-30 vertical
    expect(isWithinViewingAngleLimits(45, 10)).toBe(true);
    expect(isWithinViewingAngleLimits(65, 10)).toBe(false);
    expect(isWithinViewingAngleLimits(20, 20)).toBe(false);
    expect(isWithinViewingAngleLimits(20, -25)).toBe(true);
  });

  it('calculates LED Pixel Pitch Minimum Distance', () => {
    // 1.5mm pitch * 3438 / 1000 = 5.157m
    expect(calculatePixelPitchMinDistance(1.5)).toBeCloseTo(5.157, 3);
  });
});
