// @ts-nocheck
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
    const cables: any[] = [
      { id: 'c1', terminations: [ // @ts-ignore
 // @ts-ignore
 // @ts-ignore

        { deviceId: 'd1', portRef: { kind: 'interface', name: 'out1', id: 'out1' } },
        { deviceId: 'd3', portRef: { kind: 'interface', name: 'in1', id: 'in1' } }
      ] }
    ] as unknown;
    const newCable = { sourceId: 'd1', sourcePort: 'out1', targetId: 'd2', targetPort: 'in1' };
    expect(validatePortOccupancy(newCable, cables)).toBe(false);
  });

  it('rejects connection if target port is occupied', () => {
    const cables: any[] = [
      { id: 'c1', terminations: [ // @ts-ignore
 // @ts-ignore

        { deviceId: 'd3', portRef: { kind: 'interface', name: 'out1', id: 'out1' } },
        { deviceId: 'd2', portRef: { kind: 'interface', name: 'in1', id: 'in1' } }
      ] }
    ] as unknown;
    const newCable = { sourceId: 'd1', sourcePort: 'out1', targetId: 'd2', targetPort: 'in1' };
    expect(validatePortOccupancy(newCable, cables)).toBe(false);
  });
});
