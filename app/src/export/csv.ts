import type { DesignDocument } from '../model/schema';

export function exportCablesToCsv(document: DesignDocument): string {
  const header = 'Source Device,Source Port,Target Device,Target Port,Signal Type';
  
  const deviceMap = new Map(document.devices.map(d => [d.id, d.name ?? d.id]));

  const rows = document.cables.map((cable) => {
    const srcTerm = cable.terminations[0];
    const tgtTerm = cable.terminations[1];

    const srcDevice = deviceMap.get(srcTerm.deviceId) ?? srcTerm.deviceId;
    const tgtDevice = deviceMap.get(tgtTerm.deviceId) ?? tgtTerm.deviceId;

    const srcPort = srcTerm.portRef.name;
    const tgtPort = tgtTerm.portRef.name;
    const signalType = cable.type ?? '';

    const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;

    return [srcDevice, srcPort, tgtDevice, tgtPort, signalType].map(escape).join(',');
  });

  return [header, ...rows].join('\n');
}

