import { describe, it, expect } from 'vitest';
import { generateArrayPreset, computePolar } from '../nearfield';

describe('Subwoofer Array Beamforming', () => {
  it('B99: Endfire preset produces a rear null < -60 dB', () => {
    const f = 60; // Hz
    const sources = generateArrayPreset('Endfire', 4, f);
    
    // Evaluate in far-field to avoid 1/r differences dominating
    const polar = computePolar(sources, f, 10000, 1);
    
    const front = polar.find(p => p.angle === 0);
    const rear = polar.find(p => p.angle === 180);
    
    expect(front).toBeDefined();
    expect(rear).toBeDefined();
    
    expect(front!.db).toBeCloseTo(0, 1);
    expect(rear!.db).toBeLessThan(-60);
  });

  it('Cardioid preset produces a rear null', () => {
    const f = 60;
    const sources = generateArrayPreset('Cardioid', 2, f);
    const polar = computePolar(sources, f, 10000, 1);
    
    const front = polar.find(p => p.angle === 0);
    const rear = polar.find(p => p.angle === 180);
    
    expect(front!.db).toBeCloseTo(0, 1);
    expect(rear!.db).toBeLessThan(-60);
  });
});
