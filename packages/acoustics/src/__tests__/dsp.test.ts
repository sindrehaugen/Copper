import { describe, it, expect } from 'vitest';
import { getLR24, evaluateCascade, addComplex, complexMagnitudeDb } from '../dsp';

describe('DSP Crossovers', () => {
  it('LR24 LPF and HPF should sum to exactly 0dB (flat magnitude response)', () => {
    const fs = 48000;
    const f0 = 1000;

    const lpfCascade = getLR24('lpf', f0, fs);
    const hpfCascade = getLR24('hpf', f0, fs);

    const freqsToTest = [100, 500, 1000, 2000, 10000];

    for (const f of freqsToTest) {
      const H_lpf = evaluateCascade(lpfCascade, f, fs);
      const H_hpf = evaluateCascade(hpfCascade, f, fs);

      // In LR24, LPF and HPF outputs are perfectly in phase, so their sum gives flat magnitude
      const sum = addComplex(H_lpf, H_hpf);
      const magDb = complexMagnitudeDb(sum);
      
      // We expect 0 dB sum across all frequencies
      expect(magDb).toBeCloseTo(0, 3);
    }
  });
  
  it('LR24 cross point is at -6dB', () => {
    const fs = 48000;
    const f0 = 1000;

    const lpfCascade = getLR24('lpf', f0, fs);
    const H_lpf = evaluateCascade(lpfCascade, f0, fs);
    const magDb = complexMagnitudeDb(H_lpf);
    
    // LR24 crosses at -6dB
    expect(magDb).toBeCloseTo(-6.02, 2);
  });
});
