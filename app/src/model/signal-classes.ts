export type SignalClass = 'AUDIO' | 'VIDEO' | 'CONTROL' | 'NETWORK' | 'POWER' | 'RF' | 'UNKNOWN';

export const SIGNAL_CLASSES: SignalClass[] = [
  'AUDIO',
  'VIDEO',
  'CONTROL',
  'NETWORK',
  'POWER',
  'RF',
  'UNKNOWN',
];

/**
 * Extension — no NetBox equivalent
 * Represents the three independent facts of a port.
 */
export interface PortFacts {
  type: string;
  signalType?: string;
  connectorType?: string;
}

export function isValidSignalClass(val: string): val is SignalClass {
  return SIGNAL_CLASSES.includes(val as SignalClass);
}

export function isValidPortFacts(facts: PortFacts): boolean {
  return typeof facts.type === 'string' && facts.type.trim() !== '';
}
