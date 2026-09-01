import { describe, it, expect } from 'vitest';
import { computeRoomCoverage } from '../coverage';
import { RoomGeometry } from '../room';

describe('Coverage Overlay Engine', () => {
  it('B100: Computes direct, reverberant, RT60, and STI accurately', () => {
    // Standard classroom
    const roomDim: RoomGeometry = {
      depth: 10,
      frontWidth: 10,
      rearWidth: 10,
      floorFrontZ: 0,
      floorRearZ: 0,
      ceilingFrontZ: 3,
      ceilingRearZ: 3,
      absorption: 0.1
    };
    
    const speakers = [
      { position: { x: 5, y: 0, z: 3 }, sensitivity1W1m: 90, directivityQ: 4, electricalPowerW: 10 }
    ];

    const evalPoints = [
      { x: 5, y: 5, z: 1.2 },
      { x: 5, y: 9, z: 1.2 }
    ];

    const results = computeRoomCoverage(roomDim, speakers, evalPoints);

    expect(results).toHaveLength(2);
    expect(results[0].rt60).toBeGreaterThan(0.5);
    expect(results[0].directSpl).toBeCloseTo(85.5, 0);
    expect(results[1].directSpl).toBeCloseTo(80.8, 0);
    expect(results[0].sti).toBeGreaterThan(results[1].sti);
  });
});
