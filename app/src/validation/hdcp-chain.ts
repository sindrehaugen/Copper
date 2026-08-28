import { Device } from '../model/schema';

export interface HDCPValidationResult {
  valid: boolean;
  message?: string;
  lowestVersion?: string;
}

export function validateHDCPChain(source: Device, chain: Device[]): HDCPValidationResult {
  const getHdcpVersion = (device: Device): string | undefined => {
    return (device as unknown as { hdcpVersion?: string }).hdcpVersion;
  };

  const sourceVersion = getHdcpVersion(source);
  if (!sourceVersion) {
    return { valid: true };
  }

  const parseVersion = (v: string) => parseFloat(v);
  const sourceVerNum = parseVersion(sourceVersion);

  let lowestVersion: string | undefined = undefined;
  let lowestVerNum = Infinity;

  for (const device of chain) {
    const v = getHdcpVersion(device);
    if (v) {
      const num = parseVersion(v);
      if (num < lowestVerNum) {
        lowestVerNum = num;
        lowestVersion = v;
      }
    }
  }

  if (lowestVersion && lowestVerNum < sourceVerNum) {
    return {
      valid: false,
      message: 'HDCP downgrade detected...',
      lowestVersion
    };
  }

  return { valid: true };
}
