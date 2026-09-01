import { calculateCriticalDistance, calculatePAGNAGMargin } from '@copper/av-physics';
import { rt60 as calculateRT60, RoomGeometry } from '@copper/acoustics';
import { DesignDocument } from '../model/schema';
import { ValidationFinding } from './registry';

export function validateMicCoverage(doc: DesignDocument): { findings: Omit<ValidationFinding, 'source'>[] } {
  const findings: Omit<ValidationFinding, 'source'>[] = [];
  
  if (!doc.zones || doc.zones.length === 0) return { findings };

  
  const mics = doc.devices.filter(() => true);

  for (const device of mics) {
    const type = doc.deviceTypes.find(t => t.id === device.deviceTypeId);
    const micExt = (device as any).customFields?.microphone || (type as any)?.customFields?.microphone;
    if (!micExt || !micExt.polar_pattern) continue;

    const loc = doc.locations.find(l => l.id === device.locationId);
    if (!loc) continue;
    
    const vol = (loc as any).volume || 100;
    const roomMock: RoomGeometry = { depth: 10, frontWidth: 10, rearWidth: 10, floorFrontZ: 0, floorRearZ: 0, ceilingFrontZ: 3, ceilingRearZ: 3, absorption: 0.1 };
    const roomRt60 = calculateRT60(roomMock);
    const dc = calculateCriticalDistance(vol, roomRt60, 1.5);

    const D0 = 2.0; 
    const Ds = 0.5; 
    const D1 = 3.0; 
    const D2 = 2.0; 

    const margin = calculatePAGNAGMargin(Ds, D0, D1, D2, 1);
    if (margin < 6) {
      findings.push({
        targetId: device.id,
        severity: 'Warning',
        message: `PAG/NAG margin is too low (${margin.toFixed(1)}dB). Risk of acoustic feedback.`
      });
    }

    if (dc < Ds) {
      findings.push({
        targetId: device.id,
        severity: 'Warning',
        message: `Mic is placed beyond critical distance (${Ds}m > ${dc.toFixed(2)}m). Speech intelligibility will be poor.`
      });
    }
  }

  return { findings };
}
