import { test, expect, vi } from 'vitest';

import { exportToNetBox } from './netbox-export.ts';

test('exportToNetBox pushes correct payloads to NetBox', async (t) => {
  const dummyDoc = {
    schemaVersion: 1,
    designLabel: 'test',
    sites: [{ id: 's1', name: 'Site1', slug: 's1' }],
    locations: [{ id: 'l1', name: 'Loc1', slug: 'l1', siteId: 's1' }],
    racks: [{ id: 'r1', name: 'Rack1', siteId: 's1', uHeight: 42, status: 'active' }],
    deviceTypes: [{ id: 'dt1', manufacturer: 'Acme', model: 'A1', slug: 'acme-a1', uHeight: 1, isFullDepth: true }],
    devices: [{ id: 'd1', deviceTypeId: 'dt1', siteId: 's1', status: 'active' }],
    cables: []
  };

  const fetchMock = vi.fn(async (url, options) => {
    return {
      ok: true,
      json: async () => ({})
    };
  });
  
  global.fetch = fetchMock;

  await exportToNetBox(dummyDoc, 'https://netbox.local', 'dummy-token');
  
  expect(fetchMock.mock.calls.length).toBe(5);
  
  const urls = fetchMock.mock.calls.map(c => c[0]);
  expect(urls.some(u => u.includes('/api/dcim/sites/'))).toBe(true);
  expect(urls.some(u => u.includes('/api/dcim/locations/'))).toBe(true);
  expect(urls.some(u => u.includes('/api/dcim/racks/'))).toBe(true);
  expect(urls.some(u => u.includes('/api/dcim/device-types/'))).toBe(true);
  expect(urls.some(u => u.includes('/api/dcim/devices/'))).toBe(true);
});


