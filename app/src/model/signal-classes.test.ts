import { describe, it, expect } from 'vitest';
import { SIGNAL_CLASSES, isValidSignalClass, isValidPortFacts } from './signal-classes';
import type { PortFacts } from './signal-classes';

describe('Signal Classes', () => {
  it('should have a predefined list of signal classes', () => {
    expect(SIGNAL_CLASSES).toContain('AUDIO');
    expect(SIGNAL_CLASSES).toContain('VIDEO');
    expect(SIGNAL_CLASSES).toContain('UNKNOWN');
  });

  it('should validate valid signal classes', () => {
    expect(isValidSignalClass('AUDIO')).toBe(true);
    expect(isValidSignalClass('POWER')).toBe(true);
  });

  it('should invalidate invalid signal classes', () => {
    expect(isValidSignalClass('NOT_A_CLASS')).toBe(false);
    expect(isValidSignalClass('')).toBe(false);
  });
});

describe('Port Facts', () => {
  it('should typecheck correctly', () => {
    const portFacts: PortFacts = {
      type: '1000base-t',
      signalType: 'NETWORK',
      connectorType: 'rj45'
    };
    expect(portFacts.type).toBe('1000base-t');
    expect(portFacts.signalType).toBe('NETWORK');
    expect(portFacts.connectorType).toBe('rj45');
  });

  it('should allow optional fields', () => {
    const portFacts: PortFacts = {
      type: 'power',
    };
    expect(portFacts.type).toBe('power');
    expect(portFacts.signalType).toBeUndefined();
    expect(portFacts.connectorType).toBeUndefined();
  });

  it('should validate port facts', () => {
    expect(isValidPortFacts({ type: 'audio' })).toBe(true);
    expect(isValidPortFacts({ type: '' })).toBe(false);
    expect(isValidPortFacts({ type: ' ' })).toBe(false);
  });
});
