import { DesignDocument } from '../model/schema';
import { validatePoEBudget } from './poe-budget';
import { validateChannelLength } from './channel-length';
import { validatePortOccupancy } from './port-occupancy';
import { validateRackFit } from './rack-fit';
import { validateHDCPChain } from './hdcp-chain';
import { validateAudioLines } from './audio-line';
import { validateDisplaySightlines } from './display-sightlines';
import { validateCameraCoverage } from './camera-coverage';
import { validateMicCoverage } from './mic-coverage';
import { validateLighting } from './lighting';

export interface ValidationFinding {
  source: string;
  targetId?: string;
  message: string;
  severity: 'Error' | 'Warning' | 'OK';
  details?: any;
}

export interface ValidationRegistryResult {
  valid: boolean;
  findings: ValidationFinding[];
}

export function validateDocument(doc: DesignDocument): ValidationRegistryResult {
  const findings: ValidationFinding[] = [];
  
  const validators = [
    { source: 'PoE', fn: validatePoEBudget },
    { source: 'ChannelLength', fn: validateChannelLength },
    { source: 'PortOccupancy', fn: validatePortOccupancy },
    { source: 'RackFit', fn: validateRackFit },
    { source: 'HDCP', fn: validateHDCPChain },
    { source: 'AudioLine', fn: validateAudioLines },
    // 6. AV Physics (B112-B115)
    { source: 'DisplaySightlines', fn: validateDisplaySightlines },
    { source: 'CameraCoverage', fn: validateCameraCoverage },
    { source: 'MicCoverage', fn: validateMicCoverage },
    { source: 'Lighting', fn: validateLighting }
  ];

  for (const { source, fn } of validators) {
    const res = fn(doc);
    if (res && res.findings) {
      res.findings.forEach(f => findings.push({ ...f, source }));
    }
  }

  const valid = !findings.some(f => f.severity === 'Error');
  return { valid, findings };
}
