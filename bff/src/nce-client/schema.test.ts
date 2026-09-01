import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { NceTopologyResponseSchema } from './schema.js';

describe('NCE Schema Contract Drift Gate', () => {
  it('validates recorded NCE response fixtures against the strict schema', () => {
    const fixturePath = join(__dirname, '../../fixtures/nce/valid-topology.json');
    const raw = readFileSync(fixturePath, 'utf8');
    const data = JSON.parse(raw);
    
    // Should parse cleanly without throwing
    const parsed = NceTopologyResponseSchema.parse(data);
    expect(parsed.version).toBe(1);
    expect(parsed.devices?.[0]?.node.status).toBe('active');
  });
});
