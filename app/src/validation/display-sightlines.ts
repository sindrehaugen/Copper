import {
  calculateBDMMaxDistance,
  calculateISCR,
  isWithinViewingAngleLimits,
  calculateLuminance,
  calculateThrowDistance
} from "@copper/av-physics";
import { DesignDocument, Device } from "../model/schema";
import { ValidationFinding } from "./registry";

export function validateDisplaySightlines(doc: DesignDocument): { findings: Omit<ValidationFinding, "source">[] } {
  const findings: Omit<ValidationFinding, "source">[] = [];
  
  const viewerZones = doc.zones?.filter(z => z.type === "viewer" || z.type === "participant") || [];

  const getGeo = (id: string) => {
    const geo = doc.geometry?.[id];
    if (geo && geo.position) {
      return {
        x: geo.position.x * 0.01,
        y: geo.position.y * 0.01,
        width: (geo.size?.width || 0) * 0.01,
        height: (geo.size?.height || 0) * 0.01,
        rotation: geo.rotation || 0,
      };
    }
    return null;
  };

  const ambientLux = 150; 

  const getExt = (device: Device, key: "display" | "projector" | "screen") => {
    const type = doc.deviceTypes.find(t => t.id === device.deviceTypeId);
    return (device as any).customFields?.[key] || (type as any)?.customFields?.[key];
  };

  const displays = doc.devices.filter(d => getExt(d, "display"));
  const projectors = doc.devices.filter(d => getExt(d, "projector"));
  const screens = doc.devices.filter(d => getExt(d, "screen"));

  const validateSurface = (
    surfaceId: string,
    widthMeters: number,
    heightMeters: number,
    surfaceGeo: ReturnType<typeof getGeo>,
    luminanceNits: number,
    locationId?: string
  ) => {
    if (!surfaceGeo) return;
    const maxDist = calculateBDMMaxDistance(heightMeters);
    const minDist = widthMeters;
    const blackLevel = luminanceNits / 1000;
    const iscr = calculateISCR(luminanceNits, blackLevel, ambientLux);

    if (iscr < 15) {
      findings.push({
        targetId: surfaceId,
        severity: "Warning",
        message: `ISCR is too low (${iscr.toFixed(1)}:1) for ambient light of ${ambientLux} lux.`
      });
    }

    for (const zone of viewerZones) {
      if (zone.locationId && locationId && zone.locationId !== locationId) continue;
      
      const zRect = getGeo(zone.id);
      if (!zRect) continue;

      const dists = [
        Math.hypot(zRect.x - surfaceGeo.x, zRect.y - surfaceGeo.y),
        Math.hypot(zRect.x + zRect.width - surfaceGeo.x, zRect.y - surfaceGeo.y),
        Math.hypot(zRect.x - surfaceGeo.x, zRect.y + zRect.height - surfaceGeo.y),
        Math.hypot(zRect.x + zRect.width - surfaceGeo.x, zRect.y + zRect.height - surfaceGeo.y),
      ];
      const maxZoneDist = Math.max(...dists);
      const minZoneDist = Math.min(...dists);

      if (maxZoneDist > maxDist) {
        findings.push({
          targetId: surfaceId,
          severity: "Warning",
          message: `Zone ${zone.name} exceeds DISCAS max viewing distance (${maxZoneDist.toFixed(1)}m > ${maxDist.toFixed(1)}m).`
        });
      }

      if (minZoneDist < minDist) {
        findings.push({
          targetId: surfaceId,
          severity: "Warning",
          message: `Zone ${zone.name} is closer than DISCAS min viewing distance (${minZoneDist.toFixed(1)}m < ${minDist.toFixed(1)}m).`
        });
      }

      const cx = zRect.x + zRect.width / 2;
      const cy = zRect.y + zRect.height / 2;
      const angle = Math.atan2(cy - surfaceGeo.y, cx - surfaceGeo.x) * (180 / Math.PI);
      let relativeAngle = Math.abs(surfaceGeo.rotation - angle);
      if (relativeAngle > 180) relativeAngle = 360 - relativeAngle;
      
      if (!isWithinViewingAngleLimits(relativeAngle, 0)) {
         findings.push({
            targetId: surfaceId,
            severity: "Warning",
            message: `Zone ${zone.name} is outside the acceptable viewing cone.`
         });
      }
    }
  };

  for (const device of displays) {
    const ext = getExt(device, "display");
    if (!ext || !ext.diagonal) continue;
    const diagMeters = ext.diagonal * 0.0254;
    const heightMeters = diagMeters * (9 / Math.sqrt(337));
    const widthMeters = diagMeters * (16 / Math.sqrt(337));
    const nits = ext.nits || 300;
    
    validateSurface(device.id, widthMeters, heightMeters, getGeo(device.id), nits, device.locationId);
  }

  for (const proj of projectors) {
    const projExt = getExt(proj, "projector");
    if (!projExt) continue;
    
    const screen = screens.find(s => s.locationId === proj.locationId);
    if (!screen) continue;
    const screenExt = getExt(screen, "screen");
    if (!screenExt || !screenExt.width || !screenExt.height) continue;
    
    const pGeo = getGeo(proj.id);
    const sGeo = getGeo(screen.id);
    if (!pGeo || !sGeo) continue;

    const projDist = Math.hypot(pGeo.x - sGeo.x, pGeo.y - sGeo.y);
    
    if (projExt.throw_ratio_min && projExt.throw_ratio_max) {
      const [minD, maxD] = calculateThrowDistance(screenExt.width, projExt.throw_ratio_min, projExt.throw_ratio_max);
      if (projDist < minD || projDist > maxD) {
        findings.push({
          targetId: proj.id,
          severity: "Error",
          message: `Projector throw distance (${projDist.toFixed(1)}m) is outside lens envelope [${minD.toFixed(1)}m, ${maxD.toFixed(1)}m].`
        });
      }
    }
    
    const lumens = projExt.lumens || 3000;
    const area = screenExt.width * screenExt.height;
    const nits = calculateLuminance(lumens, area, screenExt.gain || 1.0);
    
    validateSurface(screen.id, screenExt.width, screenExt.height, sGeo, nits, screen.locationId);

    for (const zone of viewerZones) {
      if (zone.locationId && zone.locationId !== proj.locationId) continue;
      const zGeo = getGeo(zone.id);
      if (!zGeo) continue;
      
      const zoneDist = Math.hypot(pGeo.x - zGeo.x, pGeo.y - zGeo.y);
      const zoneToScreen = Math.hypot(sGeo.x - zGeo.x, sGeo.y - zGeo.y);
      if (Math.abs((zoneDist + zoneToScreen) - projDist) < 1.0) {
        findings.push({
          targetId: proj.id,
          severity: "Warning",
          message: `Beam obstruction detected: Zone ${zone.name} is in the projection path.`
        });
      }
    }
  }

  return { findings };
}
