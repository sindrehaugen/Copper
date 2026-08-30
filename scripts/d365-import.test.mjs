import { describe, it, expect, vi } from 'vitest';
import { transformD365, importD365ToNce } from './d365-import.ts';

const mockAuthorTopology = vi.fn().mockResolvedValue(undefined);
vi.mock('../bff/src/nce-client/index.js', () => ({
  createNceClient: vi.fn(() => ({
    authorTopology: mockAuthorTopology
  }))
}));


describe('d365-import', () => {
  const sampleFls = [
    { id: 'FL01', name: 'Main Campus', parentId: null },
    { id: 'FL01-A', name: 'Building A', parentId: 'FL01' },
    { id: 'FL01-A-1', name: 'Floor 1', parentId: 'FL01-A' },
    { id: 'FL02', name: 'Remote Site', parentId: null },
  ];

  it('should transform FLs into sites and locations', () => {
    const { sites, locations } = transformD365(sampleFls);
    
    expect(sites).toHaveLength(2);
    expect(sites[0]).toEqual({ id: 'FL01', name: 'Main Campus', slug: 'main-campus' });
    expect(sites[1]).toEqual({ id: 'FL02', name: 'Remote Site', slug: 'remote-site' });

    expect(locations).toHaveLength(2);
    expect(locations[0]).toEqual({ 
      id: 'FL01-A', 
      name: 'Building A', 
      slug: 'building-a',
      siteId: 'FL01',
      parentId: 'FL01'
    });
    expect(locations[1]).toEqual({ 
      id: 'FL01-A-1', 
      name: 'Floor 1', 
      slug: 'floor-1',
      siteId: 'FL01',
      parentId: 'FL01-A'
    });
  });

  it('should author topology to NCE', async () => {
    mockAuthorTopology.mockClear();

    await importD365ToNce('test-ns', sampleFls, 'key', 'http://localhost');

    expect(mockAuthorTopology).toHaveBeenCalledTimes(1);
    const [ns, doc] = mockAuthorTopology.mock.calls[0];
    expect(ns).toBe('test-ns');
    expect(doc.sites).toHaveLength(2);
    expect(doc.locations).toHaveLength(2);
  });
});