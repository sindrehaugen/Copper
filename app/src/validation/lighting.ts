import { DesignDocument } from '../model/schema';
import { ValidationFinding } from './registry';

export function validateLighting(doc: DesignDocument): { findings: Omit<ValidationFinding, 'source'>[] } {
  const findings: Omit<ValidationFinding, 'source'>[] = [];
  
  if (!doc.zones || doc.zones.length === 0) return { findings };

  
  const luminaires = doc.devices.filter(() => true);

  for (const device of luminaires) {
    const type = doc.deviceTypes.find(t => t.id === device.deviceTypeId);
    const lightExt = (device as any).customFields?.luminaire || (type as any)?.customFields?.luminaire;
    if (!lightExt || !lightExt.lumens) continue;

    if (lightExt.cri && lightExt.cri < 80) {
      findings.push({
        targetId: device.id,
        severity: 'Warning',
        message: `CRI (${lightExt.cri}) is below recommended 80 for VC/task lighting.`
      });
    }

    const d = 2.5;
    const lux = (lightExt.lumens / (2 * Math.PI * (1 - Math.cos((lightExt.beam_angle || 90) * Math.PI / 360)))) / (d * d);

    if (lux < 300) {
      findings.push({
        targetId: device.id,
        severity: 'Warning',
        message: `Estimated illuminance (${lux.toFixed(0)} lux) is below 300 lux target for task areas.`
      });
    }
  }

  return { findings };
}
