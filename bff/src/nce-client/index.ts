import { NceTopologyResponseSchema } from './schema.js';
import { BffConfig } from '../index.js';
import { DesignDocument, DesignDocumentSchema } from '../../../app/src/model/schema.js';
import { computeHmacSignature } from './hmac.js';
import { z } from 'zod';

export class GovernanceDisabledError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GovernanceDisabledError';
  }
}

const ValidateDesignResponseSchema = z.object({
  passed: z.boolean(),
  reasons: z.array(z.string())
});

export type ValidateDesignResponse = z.infer<typeof ValidateDesignResponseSchema>;

export class NceClient {
  constructor(private readonly config: BffConfig) {}

  private async fetchNce(method: string, endpoint: string, body?: string): Promise<Response> {
    const url = new URL(endpoint, this.config.nceBaseUrl);
    const timestamp = Date.now().toString();
    const signature = computeHmacSignature(
      method,
      url.pathname + url.search,
      timestamp,
      body,
      this.config.nceApiKey
    );

    const headers: Record<string, string> = {
      'X-NCE-Timestamp': timestamp,
      'Authorization': `HMAC-SHA256 ${signature}`,
    };

    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url.toString(), {
      method,
      headers,
      body
    });

    if (!res.ok) {
      if (res.status === 403) {
        throw new GovernanceDisabledError(`Governance disabled: ${res.statusText}`);
      }
      throw new Error(`NCE API error: ${res.status} ${res.statusText}`);
    }

    return res;
  }

  async getTopology(namespace: string): Promise<DesignDocument> {
    const res = await this.fetchNce('GET', `/api/system-design/topology?namespace=${encodeURIComponent(namespace)}`);
    const data = await res.json();
    
    if (data.error && data.error.code === -32005) {
      throw new GovernanceDisabledError('Governance disabled (-32005)');
    }

    const parsed = NceTopologyResponseSchema.parse(data);

    const doc = {
      schemaVersion: 1,
      designLabel: parsed.design?.designLabel || 'v1',
      revision: parsed.design?.revision,
      sites: parsed.functional_locations?.sites || [],
      locations: parsed.functional_locations?.locations || [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      racks: parsed.racks ? Object.values(parsed.racks).map((r: any) => r.node || r) : [],
      deviceTypes: parsed.design?.deviceTypes || [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      devices: parsed.devices ? Object.values(parsed.devices).map((d: any) => d.node || d) : [],
      cables: parsed.cables || [],
      signalClasses: parsed.design?.signalClasses || [],
    };

    return DesignDocumentSchema.parse(doc);
  }

  
  async authorTopology(namespace: string, payload: any): Promise<void> {
    const body = JSON.stringify({ namespace, ...payload });
    const res = await this.fetchNce('POST', '/api/system-design/author', body);
    const data = await res.json();
    if (data.error && data.error.code === -32005) {
      throw new GovernanceDisabledError('Governance disabled (-32005)');
    }
  }

    async promoteTopology(namespace: string, targetStatus: string, expectedVersion: string): Promise<{ revision: string }> {
    const body = JSON.stringify({ namespace, target_status: targetStatus, expected_version: expectedVersion });
    const res = await this.fetchNce('POST', '/api/system-design/promote', body);
    const data = await res.json();
    if (data.error && data.error.code === -32005) {
      throw new GovernanceDisabledError('Governance disabled (-32005)');
    }
    return data as { revision: string };
  }

  async validateDesign(namespace: string, designLabel: string): Promise<ValidateDesignResponse> {
    const body = JSON.stringify({ namespace, design_label: designLabel });
    const res = await this.fetchNce('POST', '/api/system-design/validate', body);
    
    const data = await res.json();
    if (data.error && data.error.code === -32005) {
      throw new GovernanceDisabledError('Governance disabled (-32005)');
    }

    return ValidateDesignResponseSchema.parse(data);
  }
}

export function createNceClient(config: BffConfig): NceClient {
  return new NceClient(config);
}
