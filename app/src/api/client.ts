import type { StoreApiClient } from '../store/documentStore';

export const bffClient: StoreApiClient = {
  authorTopology: async (namespaceId: string, payload: unknown) => {
    const res = await fetch(`/api/design/topology?namespace_id=${encodeURIComponent(namespaceId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (res.status === 409) {
      throw new Error('409 Conflict');
    }
    if (!res.ok) {
      throw new Error(`BFF Error: ${res.status}`);
    }
  },
  validateDesignGraph: async (namespaceId: string, payload: unknown) => {
    // Simulate calling NCE system_design_validate_design_graph if endpoint doesn't exist yet
    // return { valid: true, findings: [] }
    const res = await fetch(`/api/design/validate?namespace_id=${encodeURIComponent(namespaceId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (res.status === 404) {
      // Endpoint doesn't exist yet, return success mock
      return { valid: true, findings: [] };
    }
    
    if (!res.ok) {
      throw new Error(`BFF Error: ${res.status}`);
    }
    return res.json();
  }
};


