import { Device, DeviceType, Cable } from '../model/schema';
import { analyseChain, buildChainInput, AdapterInput, nearestIndex } from '@copper/acoustics';

export interface AudioEdgeData {
  status: string;
  dropPercent: number;
  minLoad: number;
  cableImpedanceRe: number;
  voltageAtLoad: number;
}

export interface AudioLineResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  findings: Array<{
    nodeSlug: string;
    message: string;
    severity: 'Error' | 'Warning' | 'OK';
    voltageAtLoad?: number;
    dropPercent?: number;
    minLoad?: number;
  }>;
  edgeData: Record<string, AudioEdgeData>;
}

export function validateAudioLines(
  devices: Device[],
  deviceTypes: DeviceType[],
  cables: Cable[],
  tempC: number = 20
): AudioLineResult {
  const result: AudioLineResult = {
    valid: true,
    errors: [],
    warnings: [],
    findings: [],
    edgeData: {}
  };

  const input: AdapterInput = {
    devices: devices as any,
    deviceTypes: deviceTypes as any,
    cables: cables as any,
    tempC
  };

  let chainInput;
  try {
    chainInput = buildChainInput(input);
  } catch (err: any) {
    result.valid = false;
    result.errors.push('Failed to build audio signal chain: ' + err.message);
    return result;
  }

  if (chainInput.roots.length === 0) {
    return result;
  }

  const analysis = analyseChain(chainInput);
  const idx1k = nearestIndex(chainInput.grid, 1000);

  // Map cables back to nodes to get edge data
  for (const c of cables) {
    // Assuming t[1] is the downstream target device (speaker)
    const targetId = c.terminations[1]?.deviceId;
    if (targetId) {
      const nodeAnalysis = analysis.get(targetId);
      if (nodeAnalysis) {
        result.edgeData[c.id] = {
          status: nodeAnalysis.results.status,
          dropPercent: nodeAnalysis.results.dropPercent ?? 0,
          minLoad: nodeAnalysis.results.minLoad ?? 0,
          voltageAtLoad: nodeAnalysis.results.voltageAtLoad ?? 0,
          cableImpedanceRe: nodeAnalysis.branch.cableImpedance[idx1k]?.re ?? 0
        };
      }
    }
  }

  for (const [slug, nodeAnalysis] of analysis.entries()) {
    const res = nodeAnalysis.results;
    if (res.status === 'Error' || res.status === 'Warning') {
      const finding: any = {
        nodeSlug: slug,
        message: res.status === 'Error' ? 'Critical audio line fault' : 'Audio line warning',
        severity: res.status
      };
      if (res.voltageAtLoad !== undefined) finding.voltageAtLoad = res.voltageAtLoad;
      if (res.dropPercent !== undefined) finding.dropPercent = res.dropPercent;
      if (res.minLoad !== undefined) finding.minLoad = res.minLoad;
      result.findings.push(finding);

      const msgs = [];
      if (res.dropPercent !== undefined && res.dropPercent > chainInput.quality.maxDrop) {
        msgs.push(`${res.dropPercent.toFixed(1)}% voltage drop`);
      }
      
      const msgStr = `Node ${slug}: ${msgs.join(', ')}`;
      if (res.status === 'Error') {
        result.valid = false;
        result.errors.push(msgStr);
      } else {
        result.warnings.push(msgStr);
      }
    }
  }

  return result;
}


export function suggestCablesForEdge(cableId: string, devices: Device[], deviceTypes: DeviceType[], cables: Cable[]): DeviceType[] {
  const catalogCables = deviceTypes.filter(dt => dt.customFields?.acoustics?.device_class === "cable");
  const suggestions: DeviceType[] = [];
  for (const candidate of catalogCables) {
    const testCables = cables.map(c => c.id === cableId ? { ...c, type: candidate.id } : c);
    const analysis = validateAudioLines(devices, deviceTypes, testCables);
    const edge = analysis.edgeData[cableId];
    if (edge && edge.status !== "Error") { suggestions.push(candidate); }
  }
  return suggestions;
}


export function suggestAmpsForNode(nodeId: string, devices: Device[], deviceTypes: DeviceType[], cables: Cable[]): DeviceType[] {
  const catalogAmps = deviceTypes.filter(dt => dt.customFields?.acoustics?.device_class === "amplifier");
  const suggestions: DeviceType[] = [];
  for (const candidate of catalogAmps) {
    const testDevices = devices.map(d => d.id === nodeId ? { ...d, deviceTypeId: candidate.id } : d);
    const analysis = validateAudioLines(testDevices, deviceTypes, cables);
    const finding = analysis.findings.find(f => f.nodeSlug === nodeId && f.severity === "Error");
    if (!finding) { suggestions.push(candidate); }
  }
  return suggestions;
}
