import { Rack, Device, DeviceType } from '../model/schema';

export interface RackFitError {
  deviceId: string;
  issue: 'collision' | 'out_of_bounds';
  message: string;
}

export function validateRackFit(
  rack: Rack,
  devices: Device[],
  deviceTypeMap: Map<string, DeviceType>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  _geometryMap: Record<string, any>
): RackFitError[] {
  const errors: RackFitError[] = [];

  const placedDevices = devices.filter(d => d.rackId === rack.id && d.position !== undefined && d.position !== null);

  for (const device of placedDevices) {
    const deviceType = deviceTypeMap.get(device.deviceTypeId);
    if (!deviceType) continue; 

    const uHeight = deviceType.uHeight;
    const position = device.position!;
    
    if (position < 1 || (position + uHeight - 1) > rack.uHeight) {
      errors.push({
        deviceId: device.id,
        issue: 'out_of_bounds',
        message: 'Device ' + device.id + ' at position ' + position + ' with height ' + uHeight + ' exceeds rack ' + rack.id + ' height ' + rack.uHeight,
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
          errors.push({
            deviceId: d1.id,
            issue: 'collision',
            message: 'Device ' + d1.id + ' collides with ' + d2.id
          });
          errors.push({
            deviceId: d2.id,
            issue: 'collision',
            message: 'Device ' + d2.id + ' collides with ' + d1.id
          });
        }
      }
    }
  }

  return errors;
}
