import { canConnect, PortSignature } from './connector-accepts';
import { SignalClass } from './signal-classes';

export interface Port {
  signalType?: string;
  connectorType?: string;
}

export type JoinStatus = 'direct' | 'adapter' | 'incompatible' | 'unknown';

export function validateJoin(source: Port, target: Port): JoinStatus {
  if (!source.signalType || !source.connectorType || !target.signalType || !target.connectorType) {
    return 'unknown';
  }
  
  if (source.signalType === 'UNKNOWN' || target.signalType === 'UNKNOWN') {
    return 'unknown';
  }

  if (source.signalType === target.signalType && source.connectorType.toLowerCase() === target.connectorType.toLowerCase()) {
    return 'direct';
  }

  const sigSource: PortSignature = { signalType: source.signalType as SignalClass, connectorType: source.connectorType };
  const sigTarget: PortSignature = { signalType: target.signalType as SignalClass, connectorType: target.connectorType };

  if (canConnect(sigSource, sigTarget)) {
    return 'direct';
  }

  if (source.signalType === target.signalType) {
    return 'adapter';
  }

  return 'incompatible';
}
