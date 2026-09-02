import { SignalClass } from './signal-classes';

export interface PortSignature {
  signalType: SignalClass;
  connectorType: string;
}

/**
 * Common AV combinations representing compatibility.
 * A pair in this table implies they can be plugged into each other,
 * potentially with standard/common passive adapters or direct mating.
 */
export const COMPATIBILITY_TABLE: Array<[PortSignature, PortSignature]> = [
  // Video
  [{ signalType: 'VIDEO', connectorType: 'HDMI' }, { signalType: 'VIDEO', connectorType: 'DVI-D' }],
  [{ signalType: 'VIDEO', connectorType: 'HDMI' }, { signalType: 'VIDEO', connectorType: 'DisplayPort' }],
  [{ signalType: 'VIDEO', connectorType: 'Mini DisplayPort' }, { signalType: 'VIDEO', connectorType: 'DisplayPort' }],
  [{ signalType: 'VIDEO', connectorType: 'Mini-HDMI' }, { signalType: 'VIDEO', connectorType: 'HDMI' }],
  [{ signalType: 'VIDEO', connectorType: 'Micro-HDMI' }, { signalType: 'VIDEO', connectorType: 'HDMI' }],
  [{ signalType: 'VIDEO', connectorType: 'SDI' }, { signalType: 'VIDEO', connectorType: 'BNC' }],
  [{ signalType: 'VIDEO', connectorType: 'HD-SDI' }, { signalType: 'VIDEO', connectorType: 'SDI' }],
  [{ signalType: 'VIDEO', connectorType: '3G-SDI' }, { signalType: 'VIDEO', connectorType: 'SDI' }],
  [{ signalType: 'VIDEO', connectorType: '6G-SDI' }, { signalType: 'VIDEO', connectorType: 'SDI' }],
  [{ signalType: 'VIDEO', connectorType: '12G-SDI' }, { signalType: 'VIDEO', connectorType: 'SDI' }],
  [{ signalType: 'VIDEO', connectorType: 'VGA' }, { signalType: 'VIDEO', connectorType: 'HD15' }],
  [{ signalType: 'VIDEO', connectorType: 'DVI-A' }, { signalType: 'VIDEO', connectorType: 'VGA' }],
  [{ signalType: 'VIDEO', connectorType: 'DVI-I' }, { signalType: 'VIDEO', connectorType: 'VGA' }],
  [{ signalType: 'VIDEO', connectorType: 'DVI-I' }, { signalType: 'VIDEO', connectorType: 'HDMI' }],

  // Audio
  [{ signalType: 'AUDIO', connectorType: 'XLR' }, { signalType: 'AUDIO', connectorType: 'TRS' }],
  [{ signalType: 'AUDIO', connectorType: 'XLR' }, { signalType: 'AUDIO', connectorType: 'TS' }],
  [{ signalType: 'AUDIO', connectorType: 'XLR' }, { signalType: 'AUDIO', connectorType: 'RCA' }],
  [{ signalType: 'AUDIO', connectorType: 'TRS' }, { signalType: 'AUDIO', connectorType: '1/4"' }],
  [{ signalType: 'AUDIO', connectorType: 'TS' }, { signalType: 'AUDIO', connectorType: '1/4"' }],
  [{ signalType: 'AUDIO', connectorType: 'TRS' }, { signalType: 'AUDIO', connectorType: '3.5mm' }],
  [{ signalType: 'AUDIO', connectorType: '1/8"' }, { signalType: 'AUDIO', connectorType: '3.5mm' }],
  [{ signalType: 'AUDIO', connectorType: 'RCA' }, { signalType: 'AUDIO', connectorType: 'TS' }],
  [{ signalType: 'AUDIO', connectorType: 'Phoenix' }, { signalType: 'AUDIO', connectorType: 'Bare Wire' }],
  [{ signalType: 'AUDIO', connectorType: 'Euroblock' }, { signalType: 'AUDIO', connectorType: 'Phoenix' }],
  [{ signalType: 'AUDIO', connectorType: 'Speakon' }, { signalType: 'AUDIO', connectorType: 'NL4' }],
  [{ signalType: 'AUDIO', connectorType: 'Speakon' }, { signalType: 'AUDIO', connectorType: 'NL8' }],
  [{ signalType: 'AUDIO', connectorType: 'Toslink' }, { signalType: 'AUDIO', connectorType: 'Optical' }],
  [{ signalType: 'AUDIO', connectorType: 'S/PDIF' }, { signalType: 'AUDIO', connectorType: 'RCA' }],

  // Control
  [{ signalType: 'CONTROL', connectorType: 'RS-232' }, { signalType: 'CONTROL', connectorType: 'DB9' }],
  [{ signalType: 'CONTROL', connectorType: 'RS-232' }, { signalType: 'CONTROL', connectorType: 'Phoenix' }],
  [{ signalType: 'CONTROL', connectorType: 'RS-232' }, { signalType: 'CONTROL', connectorType: 'RJ45' }],
  [{ signalType: 'CONTROL', connectorType: 'RS-422' }, { signalType: 'CONTROL', connectorType: 'DB9' }],
  [{ signalType: 'CONTROL', connectorType: 'RS-485' }, { signalType: 'CONTROL', connectorType: 'Phoenix' }],
  [{ signalType: 'CONTROL', connectorType: 'IR' }, { signalType: 'CONTROL', connectorType: '3.5mm' }],
  [{ signalType: 'CONTROL', connectorType: 'IR' }, { signalType: 'CONTROL', connectorType: 'Phoenix' }],
  [{ signalType: 'CONTROL', connectorType: 'IR' }, { signalType: 'CONTROL', connectorType: 'Bare Wire' }],
  [{ signalType: 'CONTROL', connectorType: 'Relay' }, { signalType: 'CONTROL', connectorType: 'Phoenix' }],

  // Network
  [{ signalType: 'NETWORK', connectorType: 'RJ45' }, { signalType: 'NETWORK', connectorType: 'EtherCon' }],
  [{ signalType: 'NETWORK', connectorType: 'RJ45' }, { signalType: 'NETWORK', connectorType: '8P8C' }],
  [{ signalType: 'NETWORK', connectorType: 'Fiber' }, { signalType: 'NETWORK', connectorType: 'LC' }],
  [{ signalType: 'NETWORK', connectorType: 'Fiber' }, { signalType: 'NETWORK', connectorType: 'SC' }],
  [{ signalType: 'NETWORK', connectorType: 'Fiber' }, { signalType: 'NETWORK', connectorType: 'ST' }],
  [{ signalType: 'NETWORK', connectorType: 'SFP' }, { signalType: 'NETWORK', connectorType: 'LC' }],
  [{ signalType: 'NETWORK', connectorType: 'SFP+' }, { signalType: 'NETWORK', connectorType: 'LC' }],

  // Cross-Signal / AV-over-IP / Extensions
  [{ signalType: 'VIDEO', connectorType: 'HDBaseT' }, { signalType: 'NETWORK', connectorType: 'RJ45' }],
  [{ signalType: 'VIDEO', connectorType: 'SDVoE' }, { signalType: 'NETWORK', connectorType: 'RJ45' }],
  [{ signalType: 'VIDEO', connectorType: 'SDVoE' }, { signalType: 'NETWORK', connectorType: 'SFP+' }],
  [{ signalType: 'AUDIO', connectorType: 'Dante' }, { signalType: 'NETWORK', connectorType: 'RJ45' }],
  [{ signalType: 'AUDIO', connectorType: 'AES67' }, { signalType: 'NETWORK', connectorType: 'RJ45' }],
  [{ signalType: 'AUDIO', connectorType: 'AVB' }, { signalType: 'NETWORK', connectorType: 'RJ45' }],

  // Power
  [{ signalType: 'POWER', connectorType: 'IEC' }, { signalType: 'POWER', connectorType: 'C13' }],
  [{ signalType: 'POWER', connectorType: 'IEC' }, { signalType: 'POWER', connectorType: 'C14' }],
  [{ signalType: 'POWER', connectorType: 'C13' }, { signalType: 'POWER', connectorType: 'C14' }],
  [{ signalType: 'POWER', connectorType: 'C19' }, { signalType: 'POWER', connectorType: 'C20' }],
  [{ signalType: 'POWER', connectorType: 'PowerCon' }, { signalType: 'POWER', connectorType: 'NAC3FCA' }],
  [{ signalType: 'POWER', connectorType: 'PowerCon True1' }, { signalType: 'POWER', connectorType: 'NAC3FX-W' }],
  [{ signalType: 'POWER', connectorType: 'Edison' }, { signalType: 'POWER', connectorType: 'NEMA 5-15' }],
  [{ signalType: 'POWER', connectorType: 'Bare Wire' }, { signalType: 'POWER', connectorType: 'Phoenix' }],

  // RF
  [{ signalType: 'RF', connectorType: 'BNC' }, { signalType: 'RF', connectorType: 'TNC' }],
  [{ signalType: 'RF', connectorType: 'F-Type' }, { signalType: 'RF', connectorType: 'BNC' }],
];

/**
 * Checks if port A and port B are compatible.
 * They are compatible if they have the exact same signalType and connectorType,
 * or if there's a mapped relationship in the compatibility table.
 */
export function canConnect(a: PortSignature, b: PortSignature): boolean {
  if (a.signalType === b.signalType && a.connectorType.toLowerCase() === b.connectorType.toLowerCase()) {
    return true;
  }

  for (const [p1, p2] of COMPATIBILITY_TABLE) {
    if (
      (matches(a, p1) && matches(b, p2)) ||
      (matches(a, p2) && matches(b, p1))
    ) {
      return true;
    }
  }

  return false;
}

function matches(port: PortSignature, pattern: PortSignature): boolean {
  return port.signalType === pattern.signalType && 
         port.connectorType.toLowerCase() === pattern.connectorType.toLowerCase();
}

export function getSuggestedAdapters(srcSig: PortSignature, tgtSig: PortSignature): string[] {
  const adapters: string[] = [];
  if (srcSig.signalType === 'AUDIO' && tgtSig.signalType === 'NETWORK') {
    adapters.push('Dante AVIO Adapter');
  } else if (srcSig.signalType === 'VIDEO' && tgtSig.signalType === 'NETWORK') {
    adapters.push('SDVoE Encoder');
  }
  return adapters;
}
