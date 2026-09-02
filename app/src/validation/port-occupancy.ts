import { DesignDocument } from '../model/schema';
import { ValidationFinding } from './registry';

export function validatePortOccupancy(doc: DesignDocument): { findings: Omit<ValidationFinding, 'source'>[] } {
  const findings: Omit<ValidationFinding, 'source'>[] = [];
  
  const portUsage = new Map<string, string[]>();
  
  for (const cable of doc.cables) {
    if (!cable.terminations || cable.terminations.length < 2) continue;
    
    for (const t of cable.terminations) {
      const portId = t.portRef.id ?? t.portRef.name;
      const key = t.deviceId + '::' + portId;
      
      const usedBy = portUsage.get(key) || [];
      usedBy.push(cable.id);
      portUsage.set(key, usedBy);
    }
  }
  
  for (const [key, cables] of portUsage.entries()) {
    if (cables.length > 1) {
      const [deviceId, portId] = key.split('::');
      findings.push({
        targetId: deviceId as string,
        message: `Port ${portId} on device ${deviceId} is occupied by multiple cables: ${cables.join(', ')}`,
        severity: 'Error'
      });
    }
  }

  return { findings };
}
