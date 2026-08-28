import { describe, it, expect } from 'vitest';
import { validateJoin, Port } from './validate-join';

describe('validateJoin', () => {
  it('returns "direct" for identical signalType and connectorType', () => {
    const source: Port = { signalType: 'VIDEO', connectorType: 'HDMI' };
    const target: Port = { signalType: 'VIDEO', connectorType: 'hdmi' };
    expect(validateJoin(source, target)).toBe('direct');
  });

  it('returns "direct" if canConnect returns true', () => {
    const source: Port = { signalType: 'VIDEO', connectorType: 'DisplayPort' };
    const target: Port = { signalType: 'VIDEO', connectorType: 'HDMI' }; 
    expect(validateJoin(source, target)).toBe('direct');
  });

  it('returns "adapter" if signalType matches but connectorType is incompatible', () => {
    const source: Port = { signalType: 'AUDIO', connectorType: 'XLR' };
    const target: Port = { signalType: 'AUDIO', connectorType: 'USB' }; 
    expect(validateJoin(source, target)).toBe('adapter');
  });

  it('returns "incompatible" if signalType differs and no special bridge logic exists', () => {
    const source: Port = { signalType: 'VIDEO', connectorType: 'HDMI' };
    const target: Port = { signalType: 'AUDIO', connectorType: 'XLR' };
    expect(validateJoin(source, target)).toBe('incompatible');
  });

  it('returns "unknown" if any type is unknown or missing', () => {
    const source1: Port = { signalType: 'VIDEO', connectorType: 'HDMI' };
    const target1: Port = { signalType: 'VIDEO' }; 
    expect(validateJoin(source1, target1)).toBe('unknown');

    const source2: Port = { connectorType: 'HDMI' };
    const target2: Port = { signalType: 'VIDEO', connectorType: 'HDMI' };
    expect(validateJoin(source2, target2)).toBe('unknown');

    const source3: Port = { signalType: 'UNKNOWN', connectorType: 'HDMI' };
    const target3: Port = { signalType: 'VIDEO', connectorType: 'HDMI' };
    expect(validateJoin(source3, target3)).toBe('unknown');
  });
});
