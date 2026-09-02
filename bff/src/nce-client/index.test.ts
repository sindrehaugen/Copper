import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NceClient, GovernanceDisabledError } from './index.js';
import { BffConfig } from '../index.js';

describe('NceClient', () => {
  const mockConfig: BffConfig = {
    nceBaseUrl: 'http://localhost:8080',
    nceApiKey: 'secret',
    port: 3001,
    devMode: true,
    devIdentity: { upn: 'dev', allowedNamespaces: ['test'], isDev: true }
  };

  let client: NceClient;

  beforeEach(() => {
    client = new NceClient(mockConfig);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 200 })));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('getTopology parses successful response and uses namespace_id UUID', async () => {
    const mockDoc = {
      version: 1,
      design: { designLabel: 'v1' },
      functional_locations: [],
      devices: [],
      racks: [],
      cables: [],
      edges: [],
      geometry: {}
    };

    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify(mockDoc), { status: 200 }));

    const uuid = '123e4567-e89b-12d3-a456-426614174000';
    const res = await client.getTopology(uuid, ['active', 'planned']);
    expect(res.designLabel).toBe('v1');
    
    const fetchCall = vi.mocked(fetch).mock.calls[0]!;
    expect(fetchCall[0]).toContain('/api/system-design/topology?namespace_id=123e4567-e89b-12d3-a456-426614174000&statuses=active&statuses=planned');
    expect((fetchCall[1] as RequestInit).method).toBe('GET');
  });
  
  it('getTopology throws at runtime if statuses is empty', async () => {
    const uuid = '123e4567-e89b-12d3-a456-426614174000';
    // @ts-expect-error Testing runtime check for empty array (unrepresentable at type level)
    await expect(client.getTopology(uuid, [])).rejects.toThrow('statuses must be omitted or a non-empty array');
  });

  it('authorTopology uses POST and namespace_id in query', async () => {
    const uuid = '123e4567-e89b-12d3-a456-426614174000';
    await client.authorTopology(uuid, { some: 'payload' });
    const fetchCall = vi.mocked(fetch).mock.calls[0]!;
    expect(fetchCall[0]).toContain('/api/system-design/topology?namespace_id=123e4567-e89b-12d3-a456-426614174000');
    expect((fetchCall[1] as RequestInit).method).toBe('POST');
    expect((fetchCall[1] as RequestInit).body).toBe(JSON.stringify({ some: 'payload' }));
  });

  it('authorFunctionalLocation uses POST and namespace_id in query', async () => {
    const uuid = '123e4567-e89b-12d3-a456-426614174000';
    await client.authorFunctionalLocation(uuid, { tree: 'here' });
    const fetchCall = vi.mocked(fetch).mock.calls[0]!;
    expect(fetchCall[0]).toContain('/api/system-design/functional-location?namespace_id=123e4567-e89b-12d3-a456-426614174000');
    expect((fetchCall[1] as RequestInit).method).toBe('POST');
    expect((fetchCall[1] as RequestInit).body).toBe(JSON.stringify({ tree: 'here' }));
  });

  it('validateDesign uses POST and namespace_id, design_id in body', async () => {
    const mockRes = { passed: true, reasons: [] };
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify(mockRes), { status: 200 }));

    const uuid = '123e4567-e89b-12d3-a456-426614174000';
    const res = await client.validateDesign(uuid, 'design-123');
    expect(res.passed).toBe(true);

    const fetchCall = vi.mocked(fetch).mock.calls[0]!;
    expect(fetchCall[0]).toContain('/api/system-design/validate');
    expect((fetchCall[1] as RequestInit).method).toBe('POST');
    expect((fetchCall[1] as RequestInit).body).toBe(JSON.stringify({ namespace_id: uuid, design_id: 'design-123' }));
  });

  it('deletePlanned uses DELETE and passes body properties', async () => {
    const uuid = '123e4567-e89b-12d3-a456-426614174000';
    await client.deletePlanned(uuid, { expected_version: '10', permanent: true, actor: 'sindre@example.com' });

    const fetchCall = vi.mocked(fetch).mock.calls[0]!;
    expect(fetchCall[0]).toContain('/api/system-design/planned');
    expect((fetchCall[1] as RequestInit).method).toBe('DELETE');
    expect((fetchCall[1] as RequestInit).body).toBe(JSON.stringify({
      namespace_id: uuid,
      expected_version: '10',
      permanent: true,
      actor: 'sindre@example.com'
    }));
  });

  it('throws GovernanceDisabledError on 403', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('Forbidden', { status: 403 }));
    await expect(client.getTopology('123')).rejects.toThrow(GovernanceDisabledError);
  });
  
  it('throws GovernanceDisabledError on -32005 json error', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ error: { code: -32005 } }), { status: 200 }));
    await expect(client.validateDesign('123', 'v1')).rejects.toThrow(GovernanceDisabledError);
  });

  it('throws GovernanceDisabledError on -32005 json error across write paths', async () => {
    const uuid = '123';
    // Test authorTopology
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ error: { code: -32005 } }), { status: 200 }));
    await expect(client.authorTopology(uuid, {})).rejects.toThrow(GovernanceDisabledError);

    // Test authorFunctionalLocation
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ error: { code: -32005 } }), { status: 200 }));
    await expect(client.authorFunctionalLocation(uuid, {})).rejects.toThrow(GovernanceDisabledError);

    // Test deletePlanned
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ error: { code: -32005 } }), { status: 200 }));
    await expect(client.deletePlanned(uuid)).rejects.toThrow(GovernanceDisabledError);
  });
});


