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
      ...(body ? { body } : {})
    });

    if (!res.ok) {
      if (res.status === 403) {
        throw new GovernanceDisabledError(`Governance disabled: ${res.statusText}`);
      }
      throw new Error(`NCE API error: ${res.status} ${res.statusText}`);
    }

    return res;
  }

  async getTopology(namespaceId: string, statuses?: [string, ...string[]]): Promise<DesignDocument> {
    if (statuses && statuses.length === 0) {
      throw new TypeError('statuses must be omitted or a non-empty array');
    }
    const params = new URLSearchParams();
    params.set('namespace_id', namespaceId);
    if (statuses && statuses.length > 0) {
      for (const s of statuses) {
        params.append('statuses', s);
      }
    }
    const res = await this.fetchNce('GET', `/api/system-design/topology?${params.toString()}`);
    const data = await res.json();
    
    if (data.error && data.error.code === -32005) {
      throw new GovernanceDisabledError('Governance disabled (-32005)');
    }

    const parsed = NceTopologyResponseSchema.parse(data);

    const doc = {
      schemaVersion: 1,
      designLabel: parsed.design?.designLabel || 'v1',
      revision: parsed.design?.revision,
      sites: parsed.functional_locations?.filter(f => !('siteId' in f)) || [],
      locations: parsed.functional_locations?.filter(f => 'siteId' in f) || [],
      racks: parsed.racks?.map((r) => r.node) || [],
      deviceTypes: parsed.design?.deviceTypes || [],
      devices: parsed.devices?.map((d) => d.node) || [],
      cables: parsed.cables || [],
      signalClasses: parsed.design?.signalClasses || [],
    };

    return DesignDocumentSchema.parse(doc);
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

  async authorTopology(namespaceId: string, payload: unknown): Promise<void> {
    const body = JSON.stringify(payload);
    const params = new URLSearchParams({ namespace_id: namespaceId });
    const res = await this.fetchNce('POST', `/api/system-design/topology?${params.toString()}`, body);
    
    if (!res.ok) {
      if (res.status === 403) {
        throw new GovernanceDisabledError(`Governance disabled: ${res.statusText}`);
      }
      throw new Error(`NCE API error: ${res.status} ${res.statusText}`);
    }
    
    const text = await res.text();
    if (text) {
        try {
            const data = JSON.parse(text);
            if (data.error && data.error.code === -32005) {
              throw new GovernanceDisabledError('Governance disabled (-32005)');
            }
        } catch { /* ignore */ }
    }
  }

  async authorFunctionalLocation(namespaceId: string, payload: unknown): Promise<void> {
    const body = JSON.stringify(payload);
    const params = new URLSearchParams({ namespace_id: namespaceId });
    const res = await this.fetchNce('POST', `/api/system-design/functional-location?${params.toString()}`, body);
    
    if (!res.ok) {
      if (res.status === 403) {
        throw new GovernanceDisabledError(`Governance disabled: ${res.statusText}`);
      }
      throw new Error(`NCE API error: ${res.status} ${res.statusText}`);
    }
    
    const text = await res.text();
    if (text) {
        try {
            const data = JSON.parse(text);
            if (data.error && data.error.code === -32005) {
              throw new GovernanceDisabledError('Governance disabled (-32005)');
            }
        } catch { /* ignore */ }
    }
  }

  async validateDesign(namespaceId: string, designId: string): Promise<ValidateDesignResponse> {
    const body = JSON.stringify({ namespace_id: namespaceId, design_id: designId });
    const res = await this.fetchNce('POST', '/api/system-design/validate', body);
    
    const data = await res.json();
    if (data.error && data.error.code === -32005) {
      throw new GovernanceDisabledError('Governance disabled (-32005)');
    }

    return ValidateDesignResponseSchema.parse(data);
  }

  async deletePlanned(namespaceId: string, options?: { expected_version?: string, permanent?: boolean, actor?: string }): Promise<void> {
    const bodyObj: Record<string, unknown> = { namespace_id: namespaceId };
    if (options?.expected_version !== undefined) bodyObj.expected_version = options.expected_version;
    if (options?.permanent !== undefined) bodyObj.permanent = options.permanent;
    if (options?.actor !== undefined) bodyObj.actor = options.actor;
    
    const body = JSON.stringify(bodyObj);
    const res = await this.fetchNce('DELETE', '/api/system-design/planned', body);
    
    const text = await res.text();
    if (text) {
        try {
            const data = JSON.parse(text);
            if (data.error && data.error.code === -32005) {
              throw new GovernanceDisabledError('Governance disabled (-32005)');
            }
        } catch { /* ignore */ }
    }
  }
}

export function createNceClient(config: BffConfig): NceClient {
  return new NceClient(config);
}
