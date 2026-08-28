import { Cable } from '../model/schema';

export interface ChannelLengthResult {
  valid: boolean;
  unverified?: boolean;
  errors: string[];
  warnings: string[];
}

export function validateChannelLength(cable: Cable, signalType: string): ChannelLengthResult {
  const result: ChannelLengthResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  if (cable.lengthM === undefined) {
    result.unverified = true;
    result.warnings.push('Cable length is undefined, assuming unverified.');
    return result;
  }

  const length = cable.lengthM;
  const cType = (cable.type || '').toLowerCase();
  const sType = (signalType || '').toLowerCase();

  let limit = 100;

  if (sType === 'hdbaset' || cType === 'hdbaset') {
    if (cType === 'cat6') {
      limit = 70;
    } else if (cType === 'cat6a' || cType === 'cat7') {
      limit = 100;
    } else if (cType === 'cat5e') {
      limit = 70;
    } else {
      limit = 100;
    }
  } else {
    if (cType.startsWith('cat')) {
      limit = 100;
    } else if (cType === 'smf') {
      limit = 10000;
    } else if (cType === 'mmf') {
      limit = 300;
    } else if (cType === 'hdmi') {
      limit = 15;
    } else if (cType === 'active-hdmi') {
      limit = 100;
    }
  }

  if (length > limit) {
    result.valid = false;
    const typeStr = cable.type || 'unknown';
    result.errors.push('Length ' + length + 'm exceeds limit of ' + limit + 'm for cable type ' + typeStr + ' and signal type ' + signalType + '.');
  }

  return result;
}
