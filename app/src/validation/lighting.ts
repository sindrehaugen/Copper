import { calculatePointSourceIlluminance } from '@copper/av-physics';
import { DesignDocument } from '../model/schema';
import { ValidationFinding } from './registry';

export function validateLighting(doc: DesignDocument): { findings: Omit<ValidationFinding, 'source'>[] } {
  const findings: Omit<ValidationFinding, 'source'>[] = [];
  
  const zones = doc.zones || [];
  const activeZones = zones.filter(z => ['participant', 'viewer', 'task'].includes(z.type));

  const luminaires = doc.devices.filter(d => {
    const type = doc.deviceTypes?.find(t => t.id === d.deviceTypeId);
    const ext = (d as any).customFields?.luminaire || (type as any)?.customFields?.luminaire;
    return !!ext;
  });

  const cctByRoom = new Map<string, number[]>();
  
  for (const device of luminaires) {
    const type = doc.deviceTypes?.find(t => t.id === device.deviceTypeId);
    const lightExt = (device as any).customFields?.luminaire || (type as any)?.customFields?.luminaire;

    if (lightExt.cri && lightExt.cri < 80) {
      findings.push({
        targetId: device.id,
        severity: 'Warning',
        message: `CRI (${lightExt.cri}) is below recommended 80 for VC/task lighting.`,
        details: { fixActions: ["Replace with high CRI luminaire"] }
      });
    }

    if (lightExt.cct && device.locationId) {
      if (!cctByRoom.has(device.locationId)) cctByRoom.set(device.locationId, []);
      cctByRoom.get(device.locationId)!.push(lightExt.cct);
    }
  }

  // Generate CCT mismatch findings
  for (const [locationId, ccts] of cctByRoom.entries()) {
    const maxCct = Math.max(...ccts);
    const minCct = Math.min(...ccts);
    if (maxCct - minCct > 200) {
      const roomLuminaires = luminaires.filter(l => l.locationId === locationId);
      for (const device of roomLuminaires) {
        findings.push({
          targetId: device.id,
          severity: 'Warning',
          message: `CCT mismatch in room: found varying color temperatures (${minCct}K to ${maxCct}K).`,
          details: { fixActions: ["Ensure consistent CCT across all luminaires in the room"] }
        });
      }
    }
  }

  const getGeo = (id: string) => doc.geometry?.[id]?.position;

  for (const zone of activeZones) {
    let totalLux = 0;
    const zGeo = getGeo(zone.id);
    const zX = zGeo ? zGeo.x * 0.01 : 0;
    const zY = zGeo ? zGeo.y * 0.01 : 0;
    const zZ = zGeo && zGeo.z !== undefined ? zGeo.z * 0.01 : 0;

    const roomLuminaires = luminaires.filter(l => !zone.locationId || l.locationId === zone.locationId);

    for (const device of roomLuminaires) {
      const type = doc.deviceTypes?.find(t => t.id === device.deviceTypeId);
      const lightExt = (device as any).customFields?.luminaire || (type as any)?.customFields?.luminaire;
      if (!lightExt || !lightExt.lumens) continue;

      const dGeo = getGeo(device.id);
      const dX = dGeo ? dGeo.x * 0.01 : zX; // Default to directly above if no geo
      const dY = dGeo ? dGeo.y * 0.01 : zY;
      const dZ = dGeo && dGeo.z !== undefined ? dGeo.z * 0.01 : 2.5;

      const d = Math.hypot(zX - dX, zY - dY, zZ - dZ) || 2.5;
      
      const beamAngle = lightExt.beam_angle || 90;
      const solidAngle = 2 * Math.PI * (1 - Math.cos((beamAngle * Math.PI / 180) / 2));
      const intensity = lightExt.lumens / solidAngle;
      
      totalLux += calculatePointSourceIlluminance(intensity, d);
    }

    const minLux = zone.type === 'task' ? 300 : 500;
    if (totalLux < minLux) {
      findings.push({
        targetId: zone.id,
        severity: 'Warning',
        message: `Estimated illuminance (${totalLux.toFixed(0)} lux) is below ${minLux} lux target for ${zone.type} areas.`,
        details: { fixActions: ["Add fixtures", "Increase fixture lumens", "Narrow beam angle"] }
      });
    }
  }

  return { findings };
}
