import { Cable } from '../model/schema.js';

export function validatePortOccupancy(
  newCable: { sourceId: string; sourcePort: string; targetId: string; targetPort: string },
  existingCables: Cable[]
): boolean {
  return !existingCables.some(cable => {
    if (!cable.terminations || cable.terminations.length < 2) return false;
    const [t1, t2] = cable.terminations;
    if (!t1 || !t2) return false;
    const p1id = t1.portRef.id ?? t1.portRef.name;
    const p2id = t2.portRef.id ?? t2.portRef.name;
    const match = (deviceId: string, portId: string) => 
      (deviceId === newCable.sourceId && portId === newCable.sourcePort) ||
      (deviceId === newCable.targetId && portId === newCable.targetPort);
    return match(t1.deviceId, p1id) || match(t2.deviceId, p2id);
  });
}
