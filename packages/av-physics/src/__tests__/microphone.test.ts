import { describe, it, expect } from 'vitest';
import { calculateCriticalDistance, calculatePAGNAGMargin, calculatePolarAttenuation } from '../microphone';

describe('Microphone & Acoustic Physics', () => {
  it('calculates Critical Distance (Dc)', () => {
    // Volume = 1000 m3, RT60 = 1.2s, Q = 1 (omni)
    // Dc = 0.057 * sqrt(1000 * 1 / 1.2) = 0.057 * 28.867 = 1.645m
    expect(calculateCriticalDistance(1000, 1.2, 1)).toBeCloseTo(1.645, 3);
  });

  it('calculates PAG/NAG Margin', () => {
    // Ds=1m, D0=10m, D1=4m, D2=6m, NOM=1
    // PAG = 20log(10) + 20log(4) - 20log(1) - 20log(6) - 10log(1) - 6
    //     = 20.0 + 12.04 - 0 - 15.56 - 0 - 6 = 10.48 dB
    // NAG = 20log(10/1) = 20.0 dB
    // Margin = 10.48 - 20.0 = -9.52 dB (Unstable!)
    expect(calculatePAGNAGMargin(1, 10, 4, 6, 1)).toBeCloseTo(-9.52, 2);
  });

  it('calculates polar pattern attenuation', () => {
    // Omni at 90 deg -> 1.0
    expect(calculatePolarAttenuation(90, 'omni')).toBe(1.0);
    // Cardioid at 90 deg -> 0.5 + 0.5*cos(90) = 0.5
    expect(calculatePolarAttenuation(90, 'cardioid')).toBeCloseTo(0.5, 3);
    // Cardioid at 180 deg -> 0.0
    expect(calculatePolarAttenuation(180, 'cardioid')).toBeCloseTo(0.0, 3);
    // Figure-8 at 90 deg -> 0.0
    expect(calculatePolarAttenuation(90, 'figure8')).toBeCloseTo(0.0, 3);
  });
});
