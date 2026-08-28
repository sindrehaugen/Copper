import { describe, it, expect } from 'vitest';
import { validateChannelLength } from './channel-length';
import { Cable } from '../model/schema';

describe('validateChannelLength', () => {
  it('should pass 90m cat6a for standard signal', () => {
    const cable: Cable = { id: 'c1', terminations: [{ deviceId: 'd1', portRef: { kind: 'interface', name: 'p1' } }, { deviceId: 'd2', portRef: { kind: 'interface', name: 'p2' } }], status: 'connected', type: 'cat6a', lengthM: 90 };
    const res = validateChannelLength(cable, 'eth');
    expect(res.valid).toBe(true);
  });

  it('should fail 140m cat6a for standard signal', () => {
    const cable: Cable = { id: 'c1', terminations: [{ deviceId: 'd1', portRef: { kind: 'interface', name: 'p1' } }, { deviceId: 'd2', portRef: { kind: 'interface', name: 'p2' } }], status: 'connected', type: 'cat6a', lengthM: 140 };
    const res = validateChannelLength(cable, 'eth');
    expect(res.valid).toBe(false);
    expect(res.errors.length).toBeGreaterThan(0);
  });

  it('should pass 300m smf', () => {
    const cable: Cable = { id: 'c1', terminations: [{ deviceId: 'd1', portRef: { kind: 'interface', name: 'p1' } }, { deviceId: 'd2', portRef: { kind: 'interface', name: 'p2' } }], status: 'connected', type: 'smf', lengthM: 300 };
    const res = validateChannelLength(cable, 'eth');
    expect(res.valid).toBe(true);
  });

  it('should fail 80m cat6 for HDBaseT', () => {
    const cable: Cable = { id: 'c1', terminations: [{ deviceId: 'd1', portRef: { kind: 'interface', name: 'p1' } }, { deviceId: 'd2', portRef: { kind: 'interface', name: 'p2' } }], status: 'connected', type: 'cat6', lengthM: 80 };
    const res = validateChannelLength(cable, 'hdbaset');
    expect(res.valid).toBe(false);
  });

  it('should handle undefined length as unverified', () => {
    const cable: Cable = { id: 'c1', terminations: [{ deviceId: 'd1', portRef: { kind: 'interface', name: 'p1' } }, { deviceId: 'd2', portRef: { kind: 'interface', name: 'p2' } }], status: 'connected', type: 'cat6a' };
    const res = validateChannelLength(cable, 'eth');
    expect(res.valid).toBe(true);
    expect(res.unverified).toBe(true);
    expect(res.warnings.length).toBeGreaterThan(0);
  });
});

