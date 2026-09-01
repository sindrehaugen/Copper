import { calculateFOV } from '@copper/av-physics';
import { DesignDocument } from '../model/schema';
import { ValidationFinding } from './registry';

export function validateCameraCoverage(doc: DesignDocument): { findings: Omit<ValidationFinding, 'source'>[] } {
  const findings: Omit<ValidationFinding, 'source'>[] = [];
  
  if (!doc.zones || doc.zones.length === 0) return { findings };

  const getZoneRect = (zoneId: string) => {
    const geo = doc.geometry?.[zoneId];
    if (geo && geo.position && geo.size) {
      return {
        x: geo.position.x * 0.01,
        y: geo.position.y * 0.01,
        width: geo.size.width * 0.01,
        height: geo.size.height * 0.01,
      };
    }
    return null;
  };

  const participantZones = doc.zones.filter(z => z.type === 'participant');

  const cameras = doc.devices.filter(() => true); // We'll filter properly inside

  for (const device of cameras) {
    const type = doc.deviceTypes.find(t => t.id === device.deviceTypeId);
    const camExt = (device as any).customFields?.camera || (type as any)?.customFields?.camera;
    if (!camExt || !camExt.sensor_size || !camExt.focal_min) continue;

    const fov = calculateFOV(camExt.sensor_size, camExt.focal_min);

    const devGeo = doc.geometry?.[device.id]?.position;
    if (!devGeo) continue;
    const devX = devGeo.x * 0.01;
    const devY = devGeo.y * 0.01;

    for (const zone of participantZones) {
      if (zone.locationId && zone.locationId !== device.locationId) continue;
      const zRect = getZoneRect(zone.id);
      if (!zRect) continue;

      const dist = Math.hypot(zRect.x + zRect.width/2 - devX, zRect.y + zRect.height/2 - devY);
      const zoneWidthAngle = 2 * Math.atan((zRect.width / 2) / dist) * (180 / Math.PI);

      if (zoneWidthAngle > fov) {
        findings.push({
          targetId: device.id,
          severity: 'Warning',
          message: `Camera FOV (${fov.toFixed(1)}°) cannot cover the entire width of ${zone.name} (${zoneWidthAngle.toFixed(1)}° required).`
        });
      }
    }
  }

  return { findings };
}
