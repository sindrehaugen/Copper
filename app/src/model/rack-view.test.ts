import { describe, it, expect } from 'vitest';
import { computeRackElevations } from './rack-view';
import { DesignDocument } from './schema';

describe('computeRackElevations', () => {
  it('groups devices into 0.5-U slots correctly and handles collisions', () => {
    const mockDoc: DesignDocument = {
      schemaVersion: 1,
      designLabel: 'Test Design',
      racks: [
        { id: 'rack-1', name: 'Rack 1', siteId: 'site-1', uHeight: 42, status: 'active' }
      ],
      deviceTypes: [
        { id: 'dt-1U', manufacturer: 'Acme', model: '1U Server', slug: '1u-server', uHeight: 1, isFullDepth: true },
        { id: 'dt-2U', manufacturer: 'Acme', model: '2U Server', slug: '2u-server', uHeight: 2, isFullDepth: true }
      ],
      devices: [
        { id: 'dev-1', deviceTypeId: 'dt-1U', siteId: 'site-1', rackId: 'rack-1', status: 'active' },
        { id: 'dev-2', deviceTypeId: 'dt-2U', siteId: 'site-1', rackId: 'rack-1', status: 'active' },
        { id: 'dev-collision', deviceTypeId: 'dt-1U', siteId: 'site-1', rackId: 'rack-1', status: 'active' }
      ],
      sites: [],
      locations: [],
      cables: [],
    
    signalClasses: [], zones: [],
    
    };

    const geometryMap = {
      'dev-1': { rack_position: 1, rack_face: 'front', x: 0, y: 0, meta: {} },
      'dev-2': { rack_position: 2, rack_face: 'rear', x: 0, y: 0, meta: {} },
      'dev-collision': { rack_position: 1, rack_face: 'front', x: 0, y: 0, meta: {} }
    };

    const elevations = computeRackElevations(mockDoc, geometryMap);

    expect(elevations.length).toBe(1);
    const rack1 = elevations[0];
    expect(rack1!.rackId).toBe('rack-1');
    
    // dev-1 occupies U 1, 1.5
    // dev-2 occupies U 2, 2.5, 3.0, 3.5
    // dev-collision occupies U 1, 1.5
    
    const slot1 = rack1!.slots.find(s => s.uNumber === 1);
    expect(slot1?.front.length).toBe(2);
    expect(slot1?.front.map(d => d.id)).toContain('dev-1');
    expect(slot1?.front.map(d => d.id)).toContain('dev-collision');

    const slot1_5 = rack1!.slots.find(s => s.uNumber === 1.5);
    expect(slot1_5?.front.length).toBe(2);

    const slot2 = rack1!.slots.find(s => s.uNumber === 2);
    expect(slot2?.rear.length).toBe(1);
    expect(slot2?.rear[0]?.id).toBe('dev-2');

    const slot3_5 = rack1!.slots.find(s => s.uNumber === 3.5);
    expect(slot3_5?.rear.length).toBe(1);
    expect(slot3_5?.rear[0]?.id).toBe('dev-2');
  });
});



