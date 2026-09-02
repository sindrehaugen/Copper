const fs = require('fs');

const poeCode = `import { DesignDocument, Device, Cable } from '../model/schema';
import { ValidationFinding } from './registry';

const POE_CLASSES: Record<number, number> = {
  1: 4.0, 2: 7.0, 3: 15.4, 4: 30.0, 5: 45.0, 6: 60.0, 7: 75.0, 8: 90.0,
};

function extractClassFromText(text: string): number | undefined {
  const match = text.match(/Class\\s*([1-8])/i);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return undefined;
}

function getDeviceDraw(device: Device): number {
  let totalAllocated = 0;
  let hasDraw = false;
  if (device.powerPorts) {
    for (const port of device.powerPorts) {
      if (port.allocatedDrawWatts !== undefined) {
        totalAllocated += port.allocatedDrawWatts;
        hasDraw = true;
      } else if (port.description) {
        const cls = extractClassFromText(port.description);
        if (cls && POE_CLASSES[cls]) {
          totalAllocated += POE_CLASSES[cls];
          hasDraw = true;
        }
      }
    }
  }
  if (!hasDraw && device.description) {
    const cls = extractClassFromText(device.description);
    if (cls && POE_CLASSES[cls]) {
      totalAllocated += POE_CLASSES[cls];
      hasDraw = true;
    }
  }
  return totalAllocated;
}

function getSwitchBudget(switchDevice: Device): number | undefined {
  let budget = 0;
  let hasBudget = false;
  if (switchDevice.powerPorts) {
    for (const port of switchDevice.powerPorts) {
      if (port.maximumDrawWatts !== undefined) {
        budget += port.maximumDrawWatts;
        hasBudget = true;
      }
    }
  }
  return hasBudget ? budget : undefined;
}

export function validatePoEBudget(doc: DesignDocument): { findings: Omit<ValidationFinding, 'source'>[] } {
  const findings: Omit<ValidationFinding, 'source'>[] = [];
  const switches = doc.devices.filter(d => 
    d.powerPorts && d.powerPorts.some(p => p.maximumDrawWatts !== undefined)
  );
  
  for (const sw of switches) {
    const budgetWatts = getSwitchBudget(sw);
    if (budgetWatts === undefined) continue;

    let totalDrawWatts = 0;
    for (const device of doc.devices) {
      if (device.id !== sw.id) {
        totalDrawWatts += getDeviceDraw(device);
      }
    }
    
    if (totalDrawWatts > budgetWatts) {
      findings.push({
        targetId: sw.id,
        message: \`Total PoE draw (\${totalDrawWatts}W) exceeds switch budget (\${budgetWatts}W).\`,
        severity: 'Error'
      });
    }
  }

  return { findings };
}
`;
fs.writeFileSync('app/src/validation/poe-budget.ts', poeCode);

const lenCode = `import { DesignDocument } from '../model/schema';
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
`;
fs.writeFileSync('app/src/validation/channel-length.ts', lenCode);

const portCode = `import { DesignDocument } from '../model/schema';
import { ValidationFinding } from './registry';

export function validatePortOccupancy(doc: DesignDocument): { findings: Omit<ValidationFinding, 'source'>[] } {
  const findings: Omit<ValidationFinding, 'source'>[] = [];
  
  const portUsage = new Map<string, string[]>();
  
  for (const cable of doc.cables) {
    if (!cable.terminations || cable.terminations.length < 2) continue;
    
    for (const t of cable.terminations) {
      const portId = t.portRef.id ?? t.portRef.name;
      const key = t.deviceId + '::' + portId;
      
      const usedBy = portUsage.get(key) || [];
      usedBy.push(cable.id);
      portUsage.set(key, usedBy);
    }
  }
  
  for (const [key, cables] of portUsage.entries()) {
    if (cables.length > 1) {
      const [deviceId, portId] = key.split('::');
      findings.push({
        targetId: deviceId,
        message: \`Port \${portId} on device \${deviceId} is occupied by multiple cables: \${cables.join(', ')}\`,
        severity: 'Error'
      });
    }
  }

  return { findings };
}
`;
fs.writeFileSync('app/src/validation/port-occupancy.ts', portCode);

const rackCode = `import { DesignDocument } from '../model/schema';
import { ValidationFinding } from './registry';

export function validateRackFit(doc: DesignDocument): { findings: Omit<ValidationFinding, 'source'>[] } {
  const findings: Omit<ValidationFinding, 'source'>[] = [];
  const deviceTypeMap = new Map(doc.deviceTypes.map(dt => [dt.id, dt]));

  for (const rack of doc.racks) {
    const placedDevices = doc.devices.filter(d => d.rackId === rack.id && d.position !== undefined && d.position !== null);

    for (const device of placedDevices) {
      const deviceType = deviceTypeMap.get(device.deviceTypeId);
      if (!deviceType) continue; 

      const uHeight = deviceType.uHeight;
      const position = device.position!;
      
      if (position < 1 || (position + uHeight - 1) > rack.uHeight) {
        findings.push({
          targetId: device.id,
          message: 'Device ' + device.id + ' at position ' + position + ' with height ' + uHeight + ' exceeds rack ' + rack.id + ' height ' + rack.uHeight,
          severity: 'Error'
        });
      }
    }

    for (let i = 0; i < placedDevices.length; i++) {
      for (let j = i + 1; j < placedDevices.length; j++) {
        const d1 = placedDevices[i];
        const d2 = placedDevices[j];
        
        if (!d1 || !d2) continue;

        const t1 = deviceTypeMap.get(d1.deviceTypeId);
        const t2 = deviceTypeMap.get(d2.deviceTypeId);
        
        if (!t1 || !t2) continue;
        
        const p1 = d1.position!;
        const h1 = t1.uHeight;
        const end1 = p1 + h1 - 1;
        
        const p2 = d2.position!;
        const h2 = t2.uHeight;
        const end2 = p2 + h2 - 1;
        
        const overlapU = p1 <= end2 && p2 <= end1;
        
        if (overlapU) {
          const face1 = d1.face || 'front';
          const face2 = d2.face || 'front';
          
          const isSameFace = face1 === face2;
          const fullDepthCollision = (t1.isFullDepth || t2.isFullDepth);
          
          if (isSameFace || fullDepthCollision) {
            findings.push({
              targetId: d1.id,
              message: 'Device ' + d1.id + ' collides with ' + d2.id,
              severity: 'Error'
            });
            findings.push({
              targetId: d2.id,
              message: 'Device ' + d2.id + ' collides with ' + d1.id,
              severity: 'Error'
            });
          }
        }
      }
    }
  }

  return { findings };
}
`;
fs.writeFileSync('app/src/validation/rack-fit.ts', rackCode);

const hdcpCode = `import { DesignDocument, Device } from '../model/schema';
import { ValidationFinding } from './registry';

export function validateHDCPChain(doc: DesignDocument): { findings: Omit<ValidationFinding, 'source'>[] } {
  const findings: Omit<ValidationFinding, 'source'>[] = [];
  const getHdcpVersion = (device: Device): string | undefined => {
    return (device as unknown as { hdcpVersion?: string }).hdcpVersion;
  };
  const parseVersion = (v: string) => parseFloat(v);

  const sources = doc.devices.filter(d => getHdcpVersion(d) !== undefined);
  
  for (const source of sources) {
    const sourceVersion = getHdcpVersion(source);
    if (!sourceVersion) continue;
    const sourceVerNum = parseVersion(sourceVersion);

    let lowestVersion: string | undefined = undefined;
    let lowestVerNum = Infinity;
    let lowestDeviceId = '';

    for (const device of doc.devices) {
      if (device.id === source.id) continue;
      const v = getHdcpVersion(device);
      if (v) {
        const num = parseVersion(v);
        if (num < lowestVerNum) {
          lowestVerNum = num;
          lowestVersion = v;
          lowestDeviceId = device.id;
        }
      }
    }

    if (lowestVersion && lowestVerNum < sourceVerNum) {
      findings.push({
        targetId: lowestDeviceId,
        message: \`HDCP downgrade detected... Source \${source.id} is \${sourceVersion}, but device \${lowestDeviceId} is \${lowestVersion}\`,
        severity: 'Error'
      });
    }
  }

  return { findings };
}
`;
fs.writeFileSync('app/src/validation/hdcp-chain.ts', hdcpCode);

const audioCode = `import { DesignDocument, Device, DeviceType, Cable } from '../model/schema';
import { analyseChain, buildChainInput, AdapterInput, nearestIndex } from '@copper/acoustics';
import { ValidationFinding } from './registry';

export function validateAudioLines(doc: DesignDocument): { findings: Omit<ValidationFinding, 'source'>[] } {
  const findings: Omit<ValidationFinding, 'source'>[] = [];
  const tempC = 20;

  const input: AdapterInput = {
    devices: doc.devices as any,
    deviceTypes: doc.deviceTypes as any,
    cables: doc.cables as any,
    tempC
  };

  let chainInput;
  try {
    chainInput = buildChainInput(input);
  } catch (err: any) {
    findings.push({
      message: 'Failed to build audio signal chain: ' + err.message,
      severity: 'Error'
    });
    return { findings };
  }

  if (chainInput.roots.length === 0) {
    return { findings };
  }

  const analysis = analyseChain(chainInput);

  for (const [slug, nodeAnalysis] of analysis.entries()) {
    const res = nodeAnalysis.results;
    if (res.status === 'Error' || res.status === 'Warning') {
      const msgs = [];
      if (res.dropPercent !== undefined && res.dropPercent > chainInput.quality.maxDrop) {
        msgs.push(\`\${res.dropPercent.toFixed(1)}% voltage drop\`);
      }
      const msgStr = \`Node \${slug}: \${msgs.join(', ')}\`;

      findings.push({
        targetId: slug,
        message: res.status === 'Error' ? 'Critical audio line fault: ' + msgStr : 'Audio line warning: ' + msgStr,
        severity: res.status as 'Error' | 'Warning',
        details: { dropPercent: res.dropPercent, minLoad: res.minLoad, voltageAtLoad: res.voltageAtLoad }
      });
    }
  }

  return { findings };
}

export function suggestCablesForEdge(cableId: string, devices: Device[], deviceTypes: DeviceType[], cables: Cable[]): DeviceType[] {
  const catalogCables = deviceTypes.filter(dt => dt.customFields?.acoustics?.device_class === "cable");
  const suggestions: DeviceType[] = [];
  for (const candidate of catalogCables) {
    const testCables = cables.map(c => c.id === cableId ? { ...c, type: candidate.id } : c);
    const doc = { devices, deviceTypes, cables: testCables } as DesignDocument;
    const result = validateAudioLines(doc);
    if (!result.findings.some((f: any) => f.severity === 'Error')) {
      suggestions.push(candidate);
    }
  }
  return suggestions;
}

export function suggestAmpsForNode(nodeId: string, devices: Device[], deviceTypes: DeviceType[], cables: Cable[]): DeviceType[] {
  const catalogAmps = deviceTypes.filter(dt => dt.customFields?.acoustics?.device_class === "amplifier");
  const suggestions: DeviceType[] = [];
  for (const candidate of catalogAmps) {
    const testDevices = devices.map(d => d.id === nodeId ? { ...d, deviceTypeId: candidate.id } : d);
    const doc = { devices: testDevices, deviceTypes, cables } as DesignDocument;
    const result = validateAudioLines(doc);
    if (!result.findings.some((f: any) => f.targetId === nodeId && f.severity === "Error")) {
      suggestions.push(candidate);
    }
  }
  return suggestions;
}
`;
fs.writeFileSync('app/src/validation/audio-line.ts', audioCode);

const regCode = `import { DesignDocument } from '../model/schema';
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
`;
fs.writeFileSync('app/src/validation/registry.ts', regCode);

const selCode = `import { useMemo } from 'react';
import { useDocumentStore } from '../store/documentStore';
import { validateDocument, ValidationFinding } from './registry';

export type EnhancedFinding = ValidationFinding & { fix?: () => void };

export function useDocumentFindings(): EnhancedFinding[] {
  const document = useDocumentStore((state: any) => state.document);
  const remoteFindings = useDocumentStore((state: any) => state.remoteFindings || []);
  const setSelectedIds = useDocumentStore((state: any) => state.setSelectedIds);

  return useMemo(() => {
    if (!document) return [];
    const result = validateDocument(document);
    
    const local = result.findings.map(f => {
      const enhanced: EnhancedFinding = { ...f };
      if (f.targetId) {
        enhanced.fix = () => setSelectedIds([f.targetId!]);
      }
      return enhanced;
    });

    return [...local, ...remoteFindings];
  }, [document, remoteFindings, setSelectedIds]);
}
`;
fs.writeFileSync('app/src/validation/selectors.ts', selCode);

const derivedCode = fs.readFileSync('app/src/store/selectors/derived.ts', 'utf8');
const newDerivedCode = derivedCode.replace('lengthM: e.lengthMeters ?? 10,', 'lengthM: e.lengthM,');
fs.writeFileSync('app/src/store/selectors/derived.ts', newDerivedCode);
