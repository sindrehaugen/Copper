import { DesignDocument } from '../model/schema';
import { ValidationFinding } from './registry';

export function validateChannelLength(doc: DesignDocument): { findings: Omit<ValidationFinding, 'source'>[] } {
  const findings: Omit<ValidationFinding, 'source'>[] = [];

  for (const cable of doc.cables) {
    if (cable.lengthM === undefined) {
      findings.push({
        targetId: cable.id,
        message: 'Cable length is undefined, assuming unverified.',
        severity: 'Warning'
      });
      continue;
    }

    const length = cable.lengthM;
    const cType = (cable.type || '').toLowerCase();
    const signalType = 'unknown'; 
    const sType = signalType.toLowerCase();

    let limit = 100;
    if (sType === 'hdbaset' || cType === 'hdbaset') {
      if (cType === 'cat6') limit = 70;
      else if (cType === 'cat6a' || cType === 'cat7') limit = 100;
      else if (cType === 'cat5e') limit = 70;
      else limit = 100;
    } else {
      if (cType.startsWith('cat')) limit = 100;
      else if (cType === 'smf') limit = 10000;
      else if (cType === 'mmf') limit = 300;
      else if (cType === 'hdmi') limit = 15;
      else if (cType === 'active-hdmi') limit = 100;
    }

    if (length > limit) {
      findings.push({
        targetId: cable.id,
        message: 'Length ' + length + 'm exceeds limit of ' + limit + 'm for cable type ' + (cable.type || 'unknown') + '.',
        severity: 'Error'
      });
    }
  }

  return { findings };
}
