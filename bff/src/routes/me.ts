import { Hono } from 'hono';

import { customerViewMaskingMiddleware } from "./redaction.js";

export const meRoutes = new Hono();

meRoutes.use("*", customerViewMaskingMiddleware());

const DSAR_ENABLED = process.env.ENABLE_DSAR === 'true';

meRoutes.get('/dsar/export', (c) => {
  if (!DSAR_ENABLED) {
    return c.json({ error: 'DSAR operations are currently disabled (HS-13)' }, 404);
  }
  return c.json({ error: 'Not implemented' }, 501);
});

meRoutes.post('/dsar/erase', (c) => {
  if (!DSAR_ENABLED) {
    return c.json({ error: 'DSAR operations are currently disabled (HS-13)' }, 404);
  }
  return c.json({ error: 'Not implemented' }, 501);
});

meRoutes.get('/dsar/provenance', (c) => {
  // Feed real records from NCE's WORM event log here.
  // For now, if disabled, return the fixture we extracted from the frontend.
  if (!DSAR_ENABLED) {
    return c.json({ records: [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        actor: 'System Admin',
        action: 'Data Privacy Check',
        originalValue: 'Unverified',
        newValue: 'Verified',
        citation: 'GDPR Article 15'
      }
    ] });
  }
  return c.json({ error: 'Not implemented' }, 501);
});
