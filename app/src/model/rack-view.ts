import { DesignDocument, Device } from './schema';

export interface RackSlot {
  uNumber: number;
  front: Device[];
  rear: Device[];
}

export interface RackElevation {
  rackId: string;
  rackName: string;
  totalU: number;
  slots: RackSlot[];
}

export function computeRackElevations(doc: DesignDocument, geometryMap: Record<string, unknown>): RackElevation[] {
  const deviceTypeMap = new Map(doc.deviceTypes.map(dt => [dt.id, dt]));

  const elevationsMap = new Map<string, RackElevation>();

  for (const rack of doc.racks) {
    const slots: RackSlot[] = [];
    for (let u = 1; u <= rack.uHeight; u += 0.5) {
      slots.push({ uNumber: u, front: [], rear: [] });
    }
    elevationsMap.set(rack.id, {
      rackId: rack.id,
      rackName: rack.name,
      totalU: rack.uHeight,
      slots,
    });
  }

  for (const device of doc.devices) {
    if (!device.rackId) continue;
    
    const elevation = elevationsMap.get(device.rackId);
    if (!elevation) continue;

    const geometry = geometryMap[device.id] as { rack_position?: number, rack_face?: string } | undefined;
    if (!geometry) continue;

    const dt = deviceTypeMap.get(device.deviceTypeId);
    if (!dt) continue;

    const { rack_position, rack_face } = geometry;
    if (typeof rack_position !== 'number') continue;

    const uHeight = dt.uHeight;
    const face = rack_face === 'rear' ? 'rear' : 'front';

    for (let step = 0; step < uHeight; step += 0.5) {
      const currentPos = rack_position + step;
      const slot = elevation.slots.find(s => s.uNumber === currentPos);
      if (slot) {
        slot[face].push(device);
      }
    }
  }

  return Array.from(elevationsMap.values());
}
