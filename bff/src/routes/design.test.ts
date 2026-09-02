import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createBffApp } from '../index.js';

describe('Design Routes', () => {
  let app: ReturnType<typeof createBffApp>;

  beforeEach(() => {
    process.env.NCE_BASE_URL = 'http://localhost:8080';
    process.env.NCE_API_KEY = 'secret';
    process.env.NODE_ENV = 'development';
    process.env.DEV_AUTO_SESSION = '1'; // Bypasses cookie auth and sets dev session
    app = createBffApp();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 200 })));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects unauthenticated requests in production', async () => {
    process.env.NODE_ENV = 'production';
    const req = new Request('http://localhost/api/design/topology?namespace_id=default');
    const res = await app.fetch(req);
    expect(res.status).toBe(401);
  });


  it('rejects GET /topology if requested namespace_id is not in the session allowed set (B121)', async () => {
    // In dev mode, the session namespace is 'default'
    const req = new Request('http://localhost/api/design/topology?namespace_id=forbidden-org');
    const res = await app.fetch(req);
    expect(res.status).toBe(403);
  });

  it('GET /topology returns 200 with valid session', async () => {
    const req = new Request('http://localhost/api/design/topology?namespace_id=default');
    const res = await app.fetch(req);
    expect(res.status).toBe(200);
  });

  it('DELETE /planned passes through 409 conflict', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('Conflict', { status: 409, statusText: 'Conflict' }));
    
    const req = new Request('http://localhost/api/design/planned', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ namespace_id: 'default', expected_version: '10' })
    });
    const res = await app.fetch(req);
    expect(res.status).toBe(409);
  });
});



