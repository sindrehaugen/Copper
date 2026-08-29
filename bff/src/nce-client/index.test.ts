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
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('getTopology parses successful response', async () => {
    const mockDoc = {
      schemaVersion: 1,
      designLabel: 'v1',
      sites: [],
      locations: [],
      racks: [],
      deviceTypes: [],
      devices: [],
      cables: [],
      signalClasses: []
    };

    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify(mockDoc), { status: 200 }));

    const res = await client.getTopology('test');
    expect(res.designLabel).toBe('v1');
    
    const fetchCall = vi.mocked(fetch).mock.calls[0];
    expect(fetchCall[0]).toContain('/api/system-design/topology?namespace=test');
    expect((fetchCall[1] as RequestInit).method).toBe('GET');
  });

  it('validateDesign passes correct body', async () => {
    const mockRes = { passed: true, reasons: [] };
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify(mockRes), { status: 200 }));

    const res = await client.validateDesign('test', 'v1');
    expect(res.passed).toBe(true);

    const fetchCall = vi.mocked(fetch).mock.calls[0];
    expect(fetchCall[0]).toContain('/api/system-design/validate');
    expect((fetchCall[1] as RequestInit).method).toBe('POST');
    expect((fetchCall[1] as RequestInit).body).toBe(JSON.stringify({ namespace: 'test', design_label: 'v1' }));
  });

  it('throws GovernanceDisabledError on 403', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('Forbidden', { status: 403 }));

    await expect(client.getTopology('test')).rejects.toThrow(GovernanceDisabledError);
  });
  
  it('throws GovernanceDisabledError on -32005 json error in validateDesign', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ error: { code: -32005 } }), { status: 200 }));

    await expect(client.validateDesign('test', 'v1')).rejects.toThrow(GovernanceDisabledError);
  });

  it('throws GovernanceDisabledError on -32005 json error in getTopology', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ error: { code: -32005 } }), { status: 200 }));

    await expect(client.getTopology('test')).rejects.toThrow(GovernanceDisabledError);
  });
});
