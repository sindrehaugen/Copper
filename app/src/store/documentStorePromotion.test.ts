import { describe, it, expect } from 'vitest';
import { useDocumentStore } from './documentStore';
import type { DesignDocument } from '../model/schema';

describe('documentStore promotion', () => {
  const sampleDoc: DesignDocument = {
    schemaVersion: 1,
    designLabel: 'Initial',
    revision: 'old-rev',
    sites: [],
    locations: [],
    racks: [],
    deviceTypes: [],
    devices: [],
    cables: [],
    signalClasses: []
  };

  it('promotes document status and updates revision', async () => {
    useDocumentStore.setState({
      document: sampleDoc,
      history: [sampleDoc],
      historyIndex: 0,
      isSaving: false,
      syncConflict: false
    });
    
    const mockClient = {
      promoteTopology: async (ns: string, status: string, rev: string) => {
        return { revision: 'new-rev' };
      }
    };

    await useDocumentStore.getState().promoteDocument(mockClient, 'ns', 'active');
    
    const state = useDocumentStore.getState();
    expect(state.document?.revision).toBe('new-rev');
    expect(state.history.length).toBe(2);
  });
});
