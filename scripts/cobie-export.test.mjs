
import { expect, test } from 'vitest';
import { exportCOBie } from './cobie-export.ts';

test('exportCOBie generates COBie sheets correctly', () => {
  const mockDoc = {
    schemaVersion: 1,
    designLabel: 'Test Project',
    sites: [{ id: 'site1', name: 'HQ', slug: 'hq' }],
    locations: [{ id: 'loc1', name: 'Room 1', slug: 'r1', siteId: 'site1' }],
    racks: [{ id: 'rack1', name: 'Rack A', siteId: 'site1', uHeight: 42, status: 'active' }],
    deviceTypes: [{ id: 'dt1', manufacturer: 'Cisco', model: 'Switch', slug: 'cisco-switch', uHeight: 1, isFullDepth: true }],
    devices: [{ id: 'dev1', designation: 'SW-01', deviceTypeId: 'dt1', siteId: 'site1', locationId: 'loc1', status: 'active', interfaces: [{ id: 'if1', name: 'eth0', type: '1000base-t', signalClassId: 'sig1' }] }],
    cables: [],
    signalClasses: [{ id: 'sig1', name: 'Data', category: 'Network' }]
  };

  const result = exportCOBie(mockDoc);
  
  expect(result.Facility).toContain('Test Project');
  expect(result.Facility).toContain('HQ');
  expect(result.Floor).toContain('HQ');
  expect(result.Space).toContain('Room 1');
  expect(result.Type).toContain('Cisco Switch');
  expect(result.Component).toContain('Rack A');
  expect(result.Component).toContain('SW-01');
  expect(result.System).toContain('Data');
  expect(result.System).toContain('SW-01');
});
