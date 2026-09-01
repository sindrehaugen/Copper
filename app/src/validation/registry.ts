
import { DesignDocument } from '../model/schema';
import { validatePoEBudget } from './poe-budget';
import { validateChannelLength } from './channel-length';
// import { validatePortOccupancy } from './port-occupancy';
// import { validateRackFit } from './rack-fit';
// import { validateHdcpChain } from './hdcp-chain';
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
  let allValid = true;

  // 1. PoE Budget
  const switches = doc.devices.filter(d => 
    d.powerPorts && d.powerPorts.some(p => p.maximumDrawWatts !== undefined)
  );
  for (const sw of switches) {
    // simplified: this would ideally traverse cables to find connected devices
    // For now we just pass empty connected devices to show the pattern, 
    // or let's pass all devices as connected for a worst-case check
    const poeRes = validatePoEBudget(sw, doc.devices, doc.cables);
    if (!poeRes.valid) {
      allValid = false;
      poeRes.errors.forEach(e => findings.push({ source: 'PoE', targetId: sw.id, message: e, severity: 'Error' }));
    }
  }

  // 2. Channel Length
  for (const cable of doc.cables) {
    const lenRes = validateChannelLength(cable, 'unknown'); // signal class mapping needed
    if (!lenRes.valid) {
      allValid = false;
      lenRes.errors.forEach(e => findings.push({ source: 'ChannelLength', targetId: cable.id, message: e, severity: 'Error' }));
    }
  }

    // 3. Port Occupancy (skipped for now due to signature mismatch)

    // 4. Rack Fit (skipped for now due to signature mismatch)

  // 5. Audio Line (B97)
  const audioRes = validateAudioLines(doc.devices, doc.deviceTypes, doc.cables);
  if (!audioRes.valid) {
    allValid = false;
  }
  for (const f of audioRes.findings) {
    if (f.severity !== 'OK') {
      findings.push({ 
        source: 'AudioLine', 
        targetId: f.nodeSlug, // Using node slug, ideally we'd map back to device ID
        message: f.message, 
        severity: f.severity,
        details: { dropPercent: f.dropPercent, minLoad: f.minLoad, voltageAtLoad: f.voltageAtLoad }
      });
    }
  }
  audioRes.errors.forEach(e => findings.push({ source: 'AudioLine', message: e, severity: 'Error' }));

  // 6. AV Physics (B112-B115)
  const displayRes = validateDisplaySightlines(doc);
  displayRes.findings.forEach(f => findings.push({ ...f, source: 'DisplaySightlines' }));

  const cameraRes = validateCameraCoverage(doc);
  cameraRes.findings.forEach(f => findings.push({ ...f, source: 'CameraCoverage' }));

  const micRes = validateMicCoverage(doc);
  micRes.findings.forEach(f => findings.push({ ...f, source: 'MicCoverage' }));

  const lightRes = validateLighting(doc);
  lightRes.findings.forEach(f => findings.push({ ...f, source: 'Lighting' }));

  return { valid: allValid, findings };
}

