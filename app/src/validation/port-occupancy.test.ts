import { describe, it, expect } from 'vitest';
import { validatePortOccupancy } from './port-occupancy';
import { Cable } from '../model/schema';

describe('validatePortOccupancy', () => {
  it('allows connection if ports are empty', () => {
    const cables: Cable[] = [];
    const newCable = { sourceId: 'd1', sourcePort: 'out1', targetId: 'd2', targetPort: 'in1' };
    expect(validatePortOccupancy(newCable, cables)).toBe(true);
  });

  it('rejects connection if source port is occupied', () => {
    const cables: Cable[] = [
      { id: 'c1', sourceId: 'd1', sourcePort: 'out1', targetId: 'd3', targetPort: 'in1' }
    ];
    const newCable = { sourceId: 'd1', sourcePort: 'out1', targetId: 'd2', targetPort: 'in1' };
    expect(validatePortOccupancy(newCable, cables)).toBe(false);
  });

  it('rejects connection if target port is occupied', () => {
    const cables: Cable[] = [
      { id: 'c1', sourceId: 'd3', sourcePort: 'out1', targetId: 'd2', targetPort: 'in1' }
    ];
    const newCable = { sourceId: 'd1', sourcePort: 'out1', targetId: 'd2', targetPort: 'in1' };
    expect(validatePortOccupancy(newCable, cables)).toBe(false);
  });
});
