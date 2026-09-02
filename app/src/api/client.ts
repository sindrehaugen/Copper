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
  }
};


