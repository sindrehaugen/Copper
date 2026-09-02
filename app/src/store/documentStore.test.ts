import { describe, it, expect, vi } from 'vitest';
import { useDocumentStore } from './documentStore';
import { bffClient } from '../api/client';

describe('documentStore', () => {
  it('saveDocument calls authorTopology', async () => {
    const mockDoc = {
      schemaVersion: 1 as const,
      designLabel: 'v1',
      revision: '1',
      sites: [],
      locations: [],
      racks: [],
      deviceTypes: [],
      devices: [],
      cables: [],
      signalClasses: [], zones: []
    };
    
    useDocumentStore.getState().loadDocument(mockDoc);
    
    const authorTopologySpy = vi.spyOn(bffClient, 'authorTopology').mockResolvedValue(undefined);
    
    await useDocumentStore.getState().saveDocument(bffClient, 'tenant-1', 'user-1');
    
    expect(authorTopologySpy).toHaveBeenCalledWith('tenant-1', expect.objectContaining({
      design: expect.objectContaining({ designLabel: 'v1' })
    }));
    
    authorTopologySpy.mockRestore();
  });
  
  it('surfaces 409 conflict', async () => {
    const mockDoc = {
      schemaVersion: 1 as const,
      designLabel: 'v1',
      revision: '1',
      sites: [],
      locations: [],
      racks: [],
      deviceTypes: [],
      devices: [],
      cables: [],
      signalClasses: [], zones: []
    };
    
    useDocumentStore.getState().loadDocument(mockDoc);
    
    const authorTopologySpy = vi.spyOn(bffClient, 'authorTopology').mockRejectedValue(new Error('409 Conflict'));
    
    await useDocumentStore.getState().saveDocument(bffClient, 'tenant-1', 'user-1');
    
    expect(useDocumentStore.getState().syncConflict).toBe(true);
    
    authorTopologySpy.mockRestore();
  });

  const sampleDoc: any = {
    schemaVersion: 1,
    designLabel: 'Initial',
    sites: [],
    locations: [],
    racks: [],
    deviceTypes: [],
    devices: [],
    cables: [],
    signalClasses: [], zones: []
  };

  it('loads a document and resets history', () => {
    useDocumentStore.setState({ document: null, history: [], historyIndex: -1 });
    const store = useDocumentStore.getState();
    store.loadDocument(sampleDoc);

    const state = useDocumentStore.getState();
    expect(state.document).toEqual(sampleDoc);
    expect(state.history.length).toBe(1);
    expect(state.historyIndex).toBe(0);
  });

  it('updates document using immer-like updater and pushes to history', () => {
    useDocumentStore.setState({ document: null, history: [], historyIndex: -1 });
    useDocumentStore.getState().loadDocument(sampleDoc);
    
    useDocumentStore.getState().updateDocument((draft: any) => {
      draft.designLabel = 'Updated';
    });

    const state = useDocumentStore.getState();
    expect(state.document?.designLabel).toBe('Updated');
    expect(state.history.length).toBe(2);
    expect(state.historyIndex).toBe(1);
    expect(state.history[0]?.designLabel).toBe('Initial');
    expect(state.history[1]?.designLabel).toBe('Updated');
  });

  it('undoes and redoes changes', () => {
    useDocumentStore.setState({ document: null, history: [], historyIndex: -1 });
    useDocumentStore.getState().loadDocument(sampleDoc);
    
    useDocumentStore.getState().updateDocument((draft: any) => {
      draft.designLabel = 'Updated';
    });

    useDocumentStore.getState().undo();
    
    let state = useDocumentStore.getState();
    expect(state.document?.designLabel).toBe('Initial');
    expect(state.historyIndex).toBe(0);

    useDocumentStore.getState().redo();

    state = useDocumentStore.getState();
    expect(state.document?.designLabel).toBe('Updated');
    expect(state.historyIndex).toBe(1);
  });

  it('truncates forward history when updating after undo', () => {
    useDocumentStore.setState({ document: null, history: [], historyIndex: -1 });
    useDocumentStore.getState().loadDocument(sampleDoc);
    
    useDocumentStore.getState().updateDocument((draft: any) => {
      draft.designLabel = 'Updated 1';
    });

    useDocumentStore.getState().updateDocument((draft: any) => {
      draft.designLabel = 'Updated 2';
    });

    useDocumentStore.getState().undo();

    useDocumentStore.getState().updateDocument((draft: any) => {
      draft.designLabel = 'Forked';
    });

    const state = useDocumentStore.getState();
    expect(state.document?.designLabel).toBe('Forked');
    expect(state.history.length).toBe(3);
    expect(state.historyIndex).toBe(2);
    expect(state.history[2]?.designLabel).toBe('Forked');
  });
});

