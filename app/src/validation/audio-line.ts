import { DesignDocument, Device, DeviceType, Cable } from '../model/schema';
import { analyseChain, buildChainInput, AdapterInput } from '@copper/acoustics';
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
        msgs.push(`${res.dropPercent.toFixed(1)}% voltage drop`);
      }
      const msgStr = `Node ${slug}: ${msgs.join(', ')}`;

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
