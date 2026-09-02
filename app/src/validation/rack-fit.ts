import { DesignDocument } from '../model/schema';
import { ValidationFinding } from './registry';

export function validateRackFit(doc: DesignDocument): { findings: Omit<ValidationFinding, 'source'>[] } {
  const findings: Omit<ValidationFinding, 'source'>[] = [];
  const deviceTypeMap = new Map((doc.deviceTypes || []).map(dt => [dt.id, dt]));

  for (const rack of (doc.racks || [])) {
    const placedDevices = (doc.devices || []).filter(d => d.rackMount?.rackId === rack.id && d.rackMount?.ruPosition !== undefined);

    for (const device of placedDevices) {
      const deviceType = deviceTypeMap.get(device.typeId);
      if (!deviceType) continue; 

      const uHeight = deviceType.heightRu ?? 1;
      const position = device.rackMount!.ruPosition;
      
      if (position < 1 || (position + uHeight - 1) > rack.ruCount) {
        findings.push({
          targetId: device.id,
          message: 'Device ' + device.id + ' at position ' + position + ' with height ' + uHeight + ' exceeds rack ' + rack.id + ' height ' + rack.ruCount,
          severity: 'Error'
        });
      }
    }

    for (let i = 0; i < placedDevices.length; i++) {
      for (let j = i + 1; j < placedDevices.length; j++) {
        const d1 = placedDevices[i];
        const d2 = placedDevices[j];
        
        if (!d1 || !d2) continue;

        const t1 = deviceTypeMap.get(d1.typeId);
        const t2 = deviceTypeMap.get(d2.typeId);
        
        if (!t1 || !t2) continue;
        
        const p1 = d1.rackMount!.ruPosition;
        const h1 = t1.heightRu ?? 1;
        const end1 = p1 + h1 - 1;
        
        const p2 = d2.rackMount!.ruPosition;
        const h2 = t2.heightRu ?? 1;
        const end2 = p2 + h2 - 1;
        
        const overlapU = p1 <= end2 && p2 <= end1;
        
        if (overlapU) {
          const face1 = d1.rackMount!.mountSide || 'front';
          const face2 = d2.rackMount!.mountSide || 'front';
          
          const isSameFace = face1 === face2;
          const fullDepthCollision = ((t1.depthMm || 0) > 400 || (t2.depthMm || 0) > 400); // Approximation
          
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
