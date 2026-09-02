import { DesignDocument, Device, DeviceType } from '../model/schema';
import { ValidationFinding } from './registry';

export function validateHDCPChain(doc: DesignDocument): { findings: Omit<ValidationFinding, 'source'>[] } {
  const findings: Omit<ValidationFinding, 'source'>[] = [];
  const typeMap = new Map((doc.deviceTypes || []).map(dt => [dt.id, dt]));

  const getHdcpVersion = (device: Device): string | undefined => {
    const type = typeMap.get(device.typeId);
    if (!type || !type.videoPorts) return undefined;
    
    let maxV: number = 0;
    let maxVStr: string | undefined = undefined;
    for (const port of type.videoPorts) {
      if (port.hdcpVersion) {
        const v = parseFloat(port.hdcpVersion);
        if (v > maxV) { maxV = v; maxVStr = port.hdcpVersion; }
      }
    }
    return maxVStr;
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
        message: `HDCP downgrade detected... Source ${source.id} is ${sourceVersion}, but device ${lowestDeviceId} is ${lowestVersion}`,
        severity: 'Error'
      });
    }
  }

  return { findings };
}
