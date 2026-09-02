
import { DesignDocument } from '../model/schema';
import { PortSignature } from '../model/connector-accepts';

export function getPortSignature(document: DesignDocument, deviceId: string, portId: string): PortSignature | null {
  const device = document.devices.find((d: any) => d.id === deviceId);
  if (!device) return null;

  let foundPort: any = null;
  const arrays = [device.interfaces, device.frontPorts, device.rearPorts, device.consolePorts, device.powerPorts, device.powerOutlets];
  
  for (const arr of arrays) {
    if (!arr) continue;
    for (const p of arr) {
      if (p.id === portId || (p.id == null && portId.endsWith('-' + p.name))) {
        foundPort = p;
        break;
      }
    }
    if (foundPort) break;
  }

  if (!foundPort) return null;

  let signalType = 'UNKNOWN';
  const connectorType = foundPort.type || 'Unknown';

  const ext = (device as any).customFields?.ports;
  if (ext && ext[foundPort.name]?.signal_class) {
    signalType = ext[foundPort.name].signal_class;
  } else {
    const t = connectorType.toLowerCase();
    if (t.includes('1000base') || t.includes('10gbase') || t.includes('rj-45') || t.includes('rj45')) {
      signalType = 'NETWORK';
    } else if (t.includes('hdmi') || t.includes('sdi') || t.includes('displayport')) {
      signalType = 'VIDEO';
    } else if (t.includes('xlr') || t.includes('trs') || t.includes('ts') || t.includes('speakon')) {
      signalType = 'AUDIO';
    } else if (t.includes('iec') || t.includes('nema') || t.includes('power')) {
      signalType = 'POWER';
    }
  }

  return { signalType: signalType as any, connectorType };
}

