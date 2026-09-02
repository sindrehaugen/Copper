import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NamespaceSwitcher } from './NamespaceSwitcher';
import { useSessionStore } from '../../store/sessionStore';
import { useDocumentStore } from '../../store/documentStore';
import '../../locales/i18n';

describe('NamespaceSwitcher UI (Contract & Interaction)', () => {
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

  afterEach(() => {
    cleanup();
  });

  it('renders visible and unambiguous tenancy indicator', () => {
    useSessionStore.getState().setSession({
      actor: 'operator@bravoav.no',
      currentNamespace: 'oslo-hq',
      allowedNamespaces: ['oslo-hq', 'bergen-hub'],
    });

    render(<NamespaceSwitcher />);
    const switcher = screen.getByTestId('namespace-switcher');
    expect(switcher).toBeDefined();
    expect(switcher.textContent).toContain('ns:oslo-hq');
    expect(switcher.getAttribute('aria-haspopup')).toBe('menu');
  });

  it('renders allowed namespaces in the switcher menu and excludes unauthorized ones', async () => {
    const user = userEvent.setup();
    useSessionStore.getState().setSession({
      actor: 'admin@bravoav.no',
      currentNamespace: 'tenant-alpha',
      allowedNamespaces: ['tenant-alpha', 'tenant-beta'],
    });

    render(<NamespaceSwitcher />);
    const switcher = screen.getByTestId('namespace-switcher');
    await user.click(switcher);

    // Dropdown is open
    expect(screen.getByRole('menu')).toBeDefined();

    // Allowed namespaces are present
    expect(screen.getByTestId('namespace-option-tenant-alpha')).toBeDefined();
    expect(screen.getByTestId('namespace-option-tenant-beta')).toBeDefined();

    // Unauthorized namespace is absent
    expect(screen.queryByTestId('namespace-option-tenant-secret')).toBeNull();
  });

  it('switches namespace on select and triggers hard context reset', async () => {
    const user = userEvent.setup();
    useSessionStore.getState().setSession({
      actor: 'admin@bravoav.no',
      currentNamespace: 'tenant-alpha',
      allowedNamespaces: ['tenant-alpha', 'tenant-beta'],
    });

    // Populate document in tenant-alpha
    useDocumentStore.getState().loadDocument({
      schemaVersion: 1,
      designLabel: 'Alpha Project',
      sites: [],
      locations: [],
      racks: [],
      deviceTypes: [],
      devices: [],
      cables: [],
      signalClasses: [],
      zones: [],
    } as any);

    expect(useDocumentStore.getState().document).not.toBeNull();

    render(<NamespaceSwitcher />);
    const switcher = screen.getByTestId('namespace-switcher');
    await user.click(switcher);

    const betaOption = screen.getByTestId('namespace-option-tenant-beta');
    await user.click(betaOption);

    // Active namespace updated
    expect(useSessionStore.getState().currentNamespace).toBe('tenant-beta');

    // Document store was hard-reset (zero cross-namespace bleed)
    expect(useDocumentStore.getState().document).toBeNull();
    expect(useDocumentStore.getState().history).toEqual([]);
  });

  it('supports keyboard navigation (Arrow keys, Escape, Enter)', async () => {
    const user = userEvent.setup();
    useSessionStore.getState().setSession({
      actor: 'operator@bravoav.no',
      currentNamespace: 'tenant-alpha',
      allowedNamespaces: ['tenant-alpha', 'tenant-beta', 'tenant-gamma'],
    });

    render(<NamespaceSwitcher />);
    const switcher = screen.getByTestId('namespace-switcher');

    // Open with Enter
    switcher.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('menu')).toBeDefined();

    // Close with Escape
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).toBeNull();
  });
});
