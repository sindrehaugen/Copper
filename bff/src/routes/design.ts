import { Hono } from 'hono';
import { loadConfig } from '../index.js';
import { createNceClient, GovernanceDisabledError } from '../nce-client/index.js';

export const designRoutes = new Hono<{ Variables: { session: { actor: string; namespace: string } } }>();

designRoutes.get('/topology', async (c) => {
  const config = loadConfig();
  const client = createNceClient(config);
  
  const namespaceId = c.req.query('namespace_id');
  if (!namespaceId) return c.text('Missing namespace_id', 400);
  
  const statusesParam = c.req.query('statuses');
  const statuses = statusesParam ? (statusesParam.split(',') as [string, ...string[]]) : undefined;
  
  try {
    const topology = await client.getTopology(namespaceId, statuses);
    return c.json(topology);
  } catch (err) {
    if (err instanceof GovernanceDisabledError) return c.text(err.message, 403);
    if (err instanceof TypeError) return c.text(err.message, 400);
    return c.text('Internal Error', 500);
  }
});

designRoutes.post('/topology', async (c) => {
  const config = loadConfig();
  const client = createNceClient(config);
  const namespaceId = c.req.query('namespace_id');
  if (!namespaceId) return c.text('Missing namespace_id', 400);
  
  try {
    const payload = await c.req.json();
    await client.authorTopology(namespaceId, payload);
    return c.json({ success: true });
  } catch (err: any) {
    if (err instanceof GovernanceDisabledError) return c.text(err.message, 403);
    if (err.message && err.message.includes('409')) return c.text('Conflict', 409);
    return c.text('Internal Error', 500);
  }
});

designRoutes.post('/functional-location', async (c) => {
  const config = loadConfig();
  const client = createNceClient(config);
  const namespaceId = c.req.query('namespace_id');
  if (!namespaceId) return c.text('Missing namespace_id', 400);
  
  try {
    const payload = await c.req.json();
    await client.authorFunctionalLocation(namespaceId, payload);
    return c.json({ success: true });
  } catch (err: any) {
    if (err instanceof GovernanceDisabledError) return c.text(err.message, 403);
    if (err.message && err.message.includes('409')) return c.text('Conflict', 409);
    return c.text('Internal Error', 500);
  }
});

designRoutes.post('/validate', async (c) => {
  const config = loadConfig();
  const client = createNceClient(config);
  
  try {
    const body = await c.req.json();
    const { namespace_id, design_id } = body;
    if (!namespace_id || !design_id) return c.text('Missing namespace_id or design_id', 400);
    
    const res = await client.validateDesign(namespace_id, design_id);
    return c.json(res);
  } catch (err) {
    if (err instanceof GovernanceDisabledError) return c.text(err.message, 403);
    return c.text('Internal Error', 500);
  }
});

designRoutes.delete('/planned', async (c) => {
  const config = loadConfig();
  const client = createNceClient(config);
  
  try {
    const body = await c.req.json().catch(() => ({}));
    const namespaceId = body.namespace_id || c.req.query('namespace_id');
    if (!namespaceId) return c.text('Missing namespace_id', 400);
    
    await client.deletePlanned(namespaceId, {
      expected_version: body.expected_version,
      permanent: body.permanent,
      actor: c.get('session')?.actor
    });
    return c.json({ success: true });
  } catch (err: any) {
    if (err instanceof GovernanceDisabledError) return c.text(err.message, 403);
    if (err.message && err.message.includes('409')) return c.text('Conflict', 409);
    return c.text('Internal Error', 500);
  }
});
