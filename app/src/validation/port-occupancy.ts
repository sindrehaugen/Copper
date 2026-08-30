import { Cable } from '../model/schema.js';

export function validatePortOccupancy(
  newCable: { sourceId: string; sourcePort: string; targetId: string; targetPort: string },
  existingCables: Cable[]
): boolean {
  return !existingCables.some(
    cable =>
      (cable.sourceId === newCable.sourceId && cable.sourcePort === newCable.sourcePort) ||
      (cable.targetId === newCable.targetId && cable.targetPort === newCable.targetPort) ||
      (cable.sourceId === newCable.targetId && cable.sourcePort === newCable.targetPort) ||
      (cable.targetId === newCable.sourceId && cable.targetPort === newCable.sourcePort)
  );
}
