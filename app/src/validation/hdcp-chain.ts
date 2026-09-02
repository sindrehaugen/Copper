import { DesignDocument, Device } from '../model/schema';
import { ValidationFinding } from './registry';

export function validateHDCPChain(doc: DesignDocument): { findings: Omit<ValidationFinding, 'source'>[] } {
  const findings: Omit<ValidationFinding, 'source'>[] = [];
  const typeMap = new Map((doc.deviceTypes || []).map(dt => [dt.id, dt]));

  const getHdcpVersion = (device: Device): string | undefined => {
    const type = typeMap.get(device.deviceTypeId);
    if (!type) return undefined;
    
    // Look for HDCP in customFields on the device type
    const customFields = (type as any).customFields;
    if (customFields && customFields.hdcp_version) {
      return customFields.hdcp_version.toString();
    }
    
    // Backwards compatibility for the fixture or if attached directly to device
    const legacy = (device as any).hdcpVersion || (type as any).hdcpVersion;
    if (legacy) return legacy.toString();

    // Or check if videoPorts have it
    if ((type as any).videoPorts) {
      let maxV = 0;
      let maxStr: string | undefined = undefined;
      for (const p of (type as any).videoPorts) {
        if (p.hdcpVersion) {
          const v = parseFloat(p.hdcpVersion);
          if (v > maxV) { maxV = v; maxStr = p.hdcpVersion; }
        }
      }
      if (maxStr) return maxStr;
    }

    return undefined;
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
        message: `HDCP downgrade detected. Source ${source.id} is ${sourceVersion}, but device ${lowestDeviceId} is ${lowestVersion}`,
        severity: 'Error'
      });
    }
  }

  return { findings };
}
