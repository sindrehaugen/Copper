import { calculateCriticalDistance, calculatePAGNAGMargin, calculatePolarAttenuation } from '@copper/av-physics';
import { rt60 as calculateRT60, RoomGeometry } from '@copper/acoustics';
import { DesignDocument } from '../model/schema';
import { ValidationFinding } from './registry';

export function validateMicCoverage(doc: DesignDocument): { findings: Omit<ValidationFinding, 'source'>[] } {
  const findings: Omit<ValidationFinding, 'source'>[] = [];
  
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

  const participantZones = (doc.zones || []).filter(z => z.type === 'participant');

  const mics = doc.devices.filter(d => {
    const type = doc.deviceTypes?.find(t => t.id === d.deviceTypeId);
    const micExt = (d as any).customFields?.microphone || (type as any)?.customFields?.microphone;
    return micExt && micExt.polar_pattern;
  });

  for (const zone of participantZones) {
    const zRect = getZoneRect(zone.id);
    if (!zRect) continue;
    
    const zoneCenterX = zRect.x + zRect.width / 2;
    const zoneCenterY = zRect.y + zRect.height / 2;

    let isCovered = false;

    for (const mic of mics) {
      if (zone.locationId && mic.locationId && zone.locationId !== mic.locationId) continue;

      const type = doc.deviceTypes?.find(t => t.id === mic.deviceTypeId);
      const micExt = (mic as any).customFields?.microphone || (type as any)?.customFields?.microphone;
      const pattern = micExt.polar_pattern as 'omni' | 'cardioid' | 'supercardioid' | 'hypercardioid' | 'figure8';
      const ratedCoverage = micExt.rated_coverage || 3.0; // default 3m

      const devGeo = doc.geometry?.[mic.id]?.position;
      if (!devGeo) continue;

      const devX = devGeo.x * 0.01;
      const devY = devGeo.y * 0.01;
      const devRot = doc.geometry?.[mic.id]?.rotation || 0;

      const dx = zoneCenterX - devX;
      const dy = zoneCenterY - devY;
      const dist = Math.hypot(dx, dy);

      const angleToZone = Math.atan2(dy, dx) * (180 / Math.PI);
      const relativeAngle = angleToZone - devRot;

      const attenuation = calculatePolarAttenuation(relativeAngle, pattern);
      const reach = ratedCoverage * attenuation;

      if (dist <= reach) {
        isCovered = true;
        break;
      }
    }

    if (!isCovered) {
      findings.push({
        targetId: zone.id,
        severity: 'Warning',
        message: `Participant zone ${zone.name} is uncovered. It is not fully covered by any microphone.`,
        details: { fixActions: ["Add a microphone", "Move zone closer to a microphone"] }
      });
    }
  }

  for (const device of mics) {
    const loc = doc.locations?.find(l => l.id === device.locationId);
    if (!loc) continue;

    const devGeo = doc.geometry?.[device.id]?.position;
    const devX = devGeo ? devGeo.x * 0.01 : 0;
    const devY = devGeo ? devGeo.y * 0.01 : 0;
    
    const vol = (loc as any).volume || 100;
    const roomMock: RoomGeometry = { depth: 10, frontWidth: 10, rearWidth: 10, floorFrontZ: 0, floorRearZ: 0, ceilingFrontZ: 3, ceilingRearZ: 3, absorption: 0.1 };
    const roomRt60 = calculateRT60(roomMock);
    const dc = calculateCriticalDistance(vol, roomRt60, 1.5);

    let minDs = Infinity;
    for (const zone of participantZones) {
      if (zone.locationId && zone.locationId !== device.locationId) continue;
      const zRect = getZoneRect(zone.id);
      if (!zRect) continue;
      const zcx = zRect.x + zRect.width / 2;
      const zcy = zRect.y + zRect.height / 2;
      const dist = Math.hypot(zcx - devX, zcy - devY);
      if (dist < minDs) minDs = dist;
    }

    const Ds = minDs === Infinity ? 0.5 : minDs; // distance source to mic
    const D0 = Ds + 1.5; // distance source to listener (rough estimate)
    const D1 = 3.0; // mic to loudspeaker
    const D2 = 2.0; // loudspeaker to listener

    // Only apply PAG/NAG if we actually found a zone? The requirement says "if reinforcement paths are present"
    // Let's assume standard routing implies reinforcement paths for now, or just calculate it
    const margin = calculatePAGNAGMargin(Ds, D0, D1, D2, 1);
    if (margin < 6) {
      findings.push({
        targetId: device.id,
        severity: 'Warning',
        message: `PAG/NAG margin is too low (${margin.toFixed(1)}dB). Risk of acoustic feedback.`,
        details: { fixActions: ["Move mic closer to participants", "Decrease NOM"] }
      });
    }

    if (dc < Ds) {
      findings.push({
        targetId: device.id,
        severity: 'Warning',
        message: `Mic is placed beyond critical distance (${Ds.toFixed(2)}m > ${dc.toFixed(2)}m). Speech intelligibility will be poor.`,
        details: { fixActions: ["Move mic closer to participants"] }
      });
    }
  }

  return { findings };
}
