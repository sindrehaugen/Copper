import { describe, it, expect } from 'vitest';
import { canConnect, PortSignature } from './connector-accepts';

describe('connector-accepts', () => {
  it('returns true for exact matches', () => {
    const p1: PortSignature = { signalType: 'VIDEO', connectorType: 'HDMI' };
    const p2: PortSignature = { signalType: 'VIDEO', connectorType: 'HDMI' };
    expect(canConnect(p1, p2)).toBe(true);
  });

  it('returns true for case-insensitive exact matches', () => {
    const p1: PortSignature = { signalType: 'AUDIO', connectorType: 'xlr' };
    const p2: PortSignature = { signalType: 'AUDIO', connectorType: 'XLR' };
    expect(canConnect(p1, p2)).toBe(true);
  });

  it('returns false for obviously incompatible types', () => {
    const p1: PortSignature = { signalType: 'VIDEO', connectorType: 'HDMI' };
    const p2: PortSignature = { signalType: 'AUDIO', connectorType: 'XLR' };
    expect(canConnect(p1, p2)).toBe(false);
  });

  it('returns true for known video combinations', () => {
    const p1: PortSignature = { signalType: 'VIDEO', connectorType: 'HDMI' };
    const p2: PortSignature = { signalType: 'VIDEO', connectorType: 'DVI-D' };
    expect(canConnect(p1, p2)).toBe(true);
    expect(canConnect(p2, p1)).toBe(true); // symmetrical

    const sdi: PortSignature = { signalType: 'VIDEO', connectorType: 'SDI' };
    const bnc: PortSignature = { signalType: 'VIDEO', connectorType: 'BNC' };
    expect(canConnect(sdi, bnc)).toBe(true);
  });

  it('returns true for known cross-signal combinations (AV over IP)', () => {
    const hdbt: PortSignature = { signalType: 'VIDEO', connectorType: 'HDBaseT' };
    const rj45: PortSignature = { signalType: 'NETWORK', connectorType: 'RJ45' };
    expect(canConnect(hdbt, rj45)).toBe(true);

    const dante: PortSignature = { signalType: 'AUDIO', connectorType: 'Dante' };
    expect(canConnect(dante, rj45)).toBe(true);
  });

  it('returns true for known audio combinations', () => {
    const xlr: PortSignature = { signalType: 'AUDIO', connectorType: 'XLR' };
    const trs: PortSignature = { signalType: 'AUDIO', connectorType: 'TRS' };
    expect(canConnect(xlr, trs)).toBe(true);
  });

  it('returns false for unknown connector combinations', () => {
    const p1: PortSignature = { signalType: 'VIDEO', connectorType: 'HDMI' };
    const p2: PortSignature = { signalType: 'VIDEO', connectorType: 'VGA' };
    // We didn't explicitly link HDMI direct to VGA
    expect(canConnect(p1, p2)).toBe(false);
  });
});
