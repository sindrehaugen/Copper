import { describe, it, expect, vi } from 'vitest';
import { importFromNetBox } from './netbox-import.js';

describe('importFromNetBox', () => {
  it('imports NetBox data into DesignDocument schema', async () => {
    const mockResponses = {
      '/api/dcim/sites/': {
        results: [{ id: 1, name: 'Site A', slug: 'site-a', description: 'Test Site' }]
      },
      '/api/dcim/locations/': {
        results: [{ id: 2, name: 'Loc A', slug: 'loc-a', site: { id: 1 } }]
      },
      '/api/dcim/racks/': {
        results: [{ id: 3, name: 'Rack A', site: { id: 1 }, location: { id: 2 }, u_height: 42, status: 'active' }]
      },
      '/api/dcim/device-types/': {
        results: [{ id: 4, manufacturer: { name: 'Acme' }, model: 'Switch', slug: 'switch', u_height: 1, is_full_depth: true }]
      },
      '/api/dcim/devices/': {
        results: [{ id: 5, name: 'Dev1', device_type: { id: 4 }, site: { id: 1 }, location: { id: 2 }, rack: { id: 3 }, position: 1, status: 'active' }]
      },
      '/api/dcim/cables/': {
        results: [{
          id: 6,
          a_terminations: [{ object_type: 'dcim.interface', device: { id: 5 }, name: 'eth0' }],
          b_terminations: [{ object_type: 'dcim.interface', device: { id: 5 }, name: 'eth1' }],
          status: 'connected'
        }]
      }
    };

    globalThis.fetch = vi.fn().mockImplementation((url) => {
      const endpoint = url.replace('http://netbox', '');
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponses[endpoint] || { results: [] })
      });
    });

    const doc = await importFromNetBox('http://netbox', 'token');
    
    expect(doc.schemaVersion).toBe(1);
    expect(doc.sites).toHaveLength(1);
    expect(doc.sites[0].id).toBe('1');
    expect(doc.locations).toHaveLength(1);
    expect(doc.locations[0].id).toBe('2');
    expect(doc.racks).toHaveLength(1);
    expect(doc.racks[0].id).toBe('3');
    expect(doc.deviceTypes).toHaveLength(1);
    expect(doc.deviceTypes[0].id).toBe('4');
    expect(doc.devices).toHaveLength(1);
    expect(doc.devices[0].id).toBe('5');
    expect(doc.cables).toHaveLength(1);
    expect(doc.cables[0].id).toBe('6');
    expect(doc.cables[0].terminations[0].portRef.kind).toBe('interface');
    expect(doc.cables[0].terminations[0].portRef.name).toBe('eth0');
  });
});
