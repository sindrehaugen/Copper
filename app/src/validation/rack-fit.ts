import { DesignDocument } from '../model/schema';
import { ValidationFinding } from './registry';

export function validateRackFit(doc: DesignDocument): { findings: Omit<ValidationFinding, 'source'>[] } {
  const findings: Omit<ValidationFinding, 'source'>[] = [];
  const deviceTypeMap = new Map((doc.deviceTypes || []).map(dt => [dt.id, dt]));

  for (const rack of (doc.racks || [])) {
    const placedDevices = (doc.devices || []).filter(d => d.rackId === rack.id && d.position !== undefined);

    for (const device of placedDevices) {
      const deviceType = deviceTypeMap.get(device.deviceTypeId);
      if (!deviceType) continue; 

      const pos = device.position as number;
      const rackRu = (rack as any).ruCount || (rack as any).uHeight || 42; 

      if (pos + deviceType.uHeight - 1 > rackRu) {
        findings.push({
          targetId: device.id,
          message: `Device ${device.name || device.id} (RU ${pos}-${pos + deviceType.uHeight - 1}) exceeds rack height of ${rackRu} RU`,
          severity: 'Error'
        });
      }
    }

    for (let i = 0; i < placedDevices.length; i++) {
      for (let j = i + 1; j < placedDevices.length; j++) {
        const d1 = placedDevices[i]!;
        const d2 = placedDevices[j]!;
        
        const dt1 = deviceTypeMap.get(d1.deviceTypeId);
        const dt2 = deviceTypeMap.get(d2.deviceTypeId);
        if (!dt1 || !dt2) continue;

        const pos1 = d1.position as number;
        const pos2 = d2.position as number;

        const top1 = pos1 + dt1.uHeight - 1;
        const top2 = pos2 + dt2.uHeight - 1;

        if (pos1 <= top2 && pos2 <= top1) {
          const side1 = d1.face || 'front';
          const side2 = d2.face || 'front';

          if (side1 === side2 || dt1.isFullDepth || dt2.isFullDepth) {
            findings.push({
              targetId: d1.id,
              message: `Rack overlap detected between ${d1.name || d1.id} (RU ${pos1}-${top1}) and ${d2.name || d2.id} (RU ${pos2}-${top2})`,
              severity: 'Error'
            });
            findings.push({
              targetId: d2.id,
              message: `Rack overlap detected between ${d2.name || d2.id} (RU ${pos2}-${top2}) and ${d1.name || d1.id} (RU ${pos1}-${top1})`,
              severity: 'Error'
            });
          }
        }
      }
    }
  }

  return { findings };
}
