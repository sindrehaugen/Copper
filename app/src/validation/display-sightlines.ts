import { calculateBDMMaxDistance, calculateISCR } from '@copper/av-physics';
import { DesignDocument } from '../model/schema';
import { ValidationFinding } from './registry';

export function validateDisplaySightlines(doc: DesignDocument): { findings: Omit<ValidationFinding, 'source'>[] } {
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

  const viewerZones = doc.zones.filter(z => z.type === 'viewer' || z.type === 'participant');

  const displays = doc.devices.filter(() => true);

  for (const device of displays) {
    const type = doc.deviceTypes.find(t => t.id === device.deviceTypeId);
    const displayExt = (device as any).customFields?.display || (type as any)?.customFields?.display;
    if (!displayExt || !displayExt.diagonal) continue;

    const diagMeters = displayExt.diagonal * 0.0254;
    const heightMeters = diagMeters * (9 / Math.sqrt(337));

    const maxDist = calculateBDMMaxDistance(heightMeters);

    const devGeo = doc.geometry?.[device.id]?.position;
    if (!devGeo) continue;
    const devX = devGeo.x * 0.01;
    const devY = devGeo.y * 0.01;

    for (const zone of viewerZones) {
      if (zone.locationId && zone.locationId !== device.locationId) continue;
      
      const zRect = getZoneRect(zone.id);
      if (!zRect) continue;

      const dists = [
        Math.hypot(zRect.x - devX, zRect.y - devY),
        Math.hypot(zRect.x + zRect.width - devX, zRect.y - devY),
        Math.hypot(zRect.x - devX, zRect.y + zRect.height - devY),
        Math.hypot(zRect.x + zRect.width - devX, zRect.y + zRect.height - devY),
      ];
      const maxZoneDist = Math.max(...dists);

      if (maxZoneDist > maxDist) {
        findings.push({
          targetId: device.id,
          severity: 'Warning',
          message: `Zone ${zone.name} exceeds DISCAS max viewing distance (${maxZoneDist.toFixed(1)}m > ${maxDist.toFixed(1)}m).`
        });
      }
    }
    
    const ambientLux = 150; 
    const nits = displayExt.nits || 300;
    const blackLevel = nits / 1000;
    const iscr = calculateISCR(nits, blackLevel, ambientLux);
    if (iscr < 15) {
      findings.push({
        targetId: device.id,
        severity: 'Warning',
        message: `ISCR is too low (${iscr.toFixed(1)}:1) for ambient light of ${ambientLux} lux.`
      });
    }
  }

  return { findings };
}
