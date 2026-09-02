import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSessionStore } from '../../store/sessionStore';
import { useDocumentStore } from '../../store/documentStore';

describe('Session and Namespace Management (Batch 132 / SH.W4)', () => {
  beforeEach(() => {
    useDocumentStore.setState({
      document: null,
      history: [],
      historyIndex: -1,
      selectedIds: [],
      isSaving: false,
      syncConflict: false,
      remoteFindings: [],
    });
    useSessionStore.getState().resetSession();
  });

  it('proves switching namespace drops cached data (no cross-namespace bleed)', () => {
    // 1. Initialize session with allowed namespaces
    useSessionStore.getState().setSession({
      actor: 'auditor@bravoav.no',
      currentNamespace: 'tenant-alpha',
      allowedNamespaces: ['tenant-alpha', 'tenant-beta'],
    });

    // 2. Populate documentStore in tenant-alpha with mock design data, selection, and findings
    const mockAlphaDoc: any = {
      schemaVersion: 1,
      designLabel: 'Alpha Confidential Design',
      revision: '1',
      sites: [{ id: 'site-alpha', name: 'Alpha Site', slug: 'alpha-site' }],
      locations: [],
      racks: [],
      deviceTypes: [],
      devices: [{ id: 'dev-1', deviceTypeId: 'dt-1', siteId: 'site-alpha', status: 'active' }],
      cables: [],
      signalClasses: [],
      zones: [],
    };

    useDocumentStore.getState().loadDocument(mockAlphaDoc);
    useDocumentStore.getState().setSelectedIds(['dev-1']);
    useDocumentStore.getState().setRemoteFindings([{ rule: 'RULE-1', message: 'Confidential Finding' }]);

    // Verify tenant-alpha state is loaded
    expect(useDocumentStore.getState().document?.designLabel).toBe('Alpha Confidential Design');
    expect(useDocumentStore.getState().selectedIds).toEqual(['dev-1']);
    expect(useDocumentStore.getState().remoteFindings).toHaveLength(1);
    expect(useDocumentStore.getState().history.length).toBeGreaterThan(0);

    // Track subscription teardown
    const teardownSpy = vi.fn();
    useSessionStore.getState().registerSubscriptionTeardown(teardownSpy);

    // 3. Switch namespace to tenant-beta (Hard context reset)
    const switchResult = useSessionStore.getState().switchNamespace('tenant-beta');
    expect(switchResult).toBe(true);

    // 4. Assert all caches are completely dropped (Zero cross-namespace bleed)
    const docState = useDocumentStore.getState();
    expect(docState.document).toBeNull();
    expect(docState.history).toEqual([]);
    expect(docState.historyIndex).toBe(-1);
    expect(docState.selectedIds).toEqual([]);
    expect(docState.remoteFindings).toEqual([]);
    expect(docState.syncConflict).toBe(false);

    // 5. Assert subscriptions were torn down
    expect(teardownSpy).toHaveBeenCalledTimes(1);

    // 6. Assert active namespace changed
    expect(useSessionStore.getState().currentNamespace).toBe('tenant-beta');
  });

  it('proves that a namespace absent from the session is unselectable', () => {
    // 1. Initialize session with allowed namespaces
    useSessionStore.getState().setSession({
      actor: 'operator@bravoav.no',
      currentNamespace: 'tenant-alpha',
      allowedNamespaces: ['tenant-alpha', 'tenant-beta'],
    });

    const mockDoc: any = {
      schemaVersion: 1,
      designLabel: 'Alpha Doc',
      sites: [],
      locations: [],
      racks: [],
      deviceTypes: [],
      devices: [],
      cables: [],
      signalClasses: [],
      zones: [],
    };
    useDocumentStore.getState().loadDocument(mockDoc);

    // 2. Attempt to switch to an unauthorized namespace absent from session
    const switchResult = useSessionStore.getState().switchNamespace('tenant-unauthorized');
    
    // Must be strictly unselectable / rejected
    expect(switchResult).toBe(false);

    // Active namespace must remain tenant-alpha
    expect(useSessionStore.getState().currentNamespace).toBe('tenant-alpha');

    // Document state in current namespace should NOT be dropped by a rejected switch
    expect(useDocumentStore.getState().document?.designLabel).toBe('Alpha Doc');
  });

  it('proves tenancy is visible and unambiguous in session store', () => {
    useSessionStore.getState().setSession({
      actor: 'sindre@bravoav.no',
      currentNamespace: 'nordic-ops',
      allowedNamespaces: ['nordic-ops', 'global-ops'],
    });

    const state = useSessionStore.getState();
    expect(state.actor).toBe('sindre@bravoav.no');
    expect(state.currentNamespace).toBe('nordic-ops');
    expect(state.allowedNamespaces).toEqual(['nordic-ops', 'global-ops']);
    expect(state.isAuthenticated).toBe(true);
  });
});
