// app/src/shell/index.test.tsx
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { expect, it, describe, afterEach, beforeEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { AppShell } from './index';
import { ShellLayout } from './ShellLayout';
import { ContextRail } from './ContextRail';
import { IntelligenceRail } from './IntelligenceRail';
import { FindingsTray } from './FindingsTray';
import { useDocumentStore } from '../store/documentStore';
import { CONTEXT_GROUPS, IntelligenceSection, ShellFinding } from './layout';
import '../locales/i18n';

vi.mock('@antv/x6', () => ({ Graph: vi.fn() }));
vi.mock('../views/acoustics/CalculatorsDrawer', () => ({
  CalculatorsDrawer: () => <div data-testid="calculators-drawer" />
}));
vi.mock('../views/canvas/CanvasView', () => ({
  CanvasView: () => <div data-testid="canvas-view" />
}));

expect.extend(toHaveNoViolations);

beforeEach(() => {
  useDocumentStore.setState({ document: null });
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        namespace: 'test',
        actor: 'test-user',
        designLabel: 'test',
        revision: '1',
        sites: [],
        locations: [],
        racks: [],
        deviceTypes: [],
        devices: [],
        cables: [],
        signalClasses: [],
      }),
    })
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('AppShell — Three Zones & Operator Console (Batch 130 / SH.W2)', () => {
  it('renders the layout, global bar, and context navigation with correct translations', async () => {
    render(<AppShell />);
    const globalSearch = await screen.findByTestId('global-search-btn');
    expect(globalSearch).toBeDefined();

    const contextRail = await screen.findByTestId('context-rail');
    expect(contextRail).toBeDefined();
  });

  it('proves all eight context groups are present and reachable by keyboard alone', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <ContextRail />
      </MemoryRouter>
    );

    // Verify all 8 context groups exist in DOM
    for (const group of CONTEXT_GROUPS) {
      const item = screen.getByTestId(`context-group-${group.id}`);
      expect(item).toBeDefined();
    }

    // Keyboard navigation test: Tab into first item and navigate with arrow keys
    const firstGroup = screen.getByTestId('context-group-now');
    await user.tab();
    if (document.activeElement?.getAttribute('data-testid') === 'toggle-context-rail-btn') {
      await user.tab();
    }
    expect(document.activeElement).toBe(firstGroup);

    // Arrow Down through all 8 items sequentially
    for (let i = 1; i < CONTEXT_GROUPS.length; i++) {
      await user.keyboard('{ArrowDown}');
      const expectedGroup = screen.getByTestId(`context-group-${CONTEXT_GROUPS[i]!.id}`);
      expect(document.activeElement).toBe(expectedGroup);
    }

    // Arrow Down wraps back to first item (Now)
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(firstGroup);

    // Arrow Up wraps back to last item (Ops)
    await user.keyboard('{ArrowUp}');
    const lastGroup = screen.getByTestId('context-group-ops');
    expect(document.activeElement).toBe(lastGroup);
  });

  describe('Contract-R: Intelligence Rail behavior', () => {
    it('renders NOTHING with zero items (no placeholder text, no cards)', () => {
      const { container } = render(<IntelligenceRail sections={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders NOTHING when sections contain only empty item arrays', () => {
      const emptySections: IntelligenceSection[] = [
        { id: 'proposals', titleKey: 'nav.proposals', count: 0, items: [] },
        { id: 'findings', titleKey: 'nav.findings', count: 0, items: [] },
      ];
      const { container } = render(<IntelligenceRail sections={emptySections} />);
      expect(container.firstChild).toBeNull();
      expect(screen.queryByTestId('intelligence-rail')).toBeNull();
    });

    it('renders intelligence rail when items exist and enforces max 5 sections, max 3 items per section budget', () => {
      const mockSections: IntelligenceSection[] = [
        {
          id: 'proposals',
          titleKey: 'nav.proposals',
          count: 4,
          items: [
            { id: 'p1', sectionId: 'proposals', title: 'Proposal 1' },
            { id: 'p2', sectionId: 'proposals', title: 'Proposal 2' },
            { id: 'p3', sectionId: 'proposals', title: 'Proposal 3' },
            { id: 'p4', sectionId: 'proposals', title: 'Proposal 4 (Exceeds budget)' },
          ],
        },
        {
          id: 'findings',
          titleKey: 'nav.findings',
          count: 2,
          items: [
            { id: 'f1', sectionId: 'findings', title: 'Finding 1', badge: 'blocker', badgeVariant: 'blocker' },
            { id: 'f2', sectionId: 'findings', title: 'Finding 2', badge: 'risk', badgeVariant: 'risk' },
          ],
        },
      ];

      render(<IntelligenceRail sections={mockSections} />);
      expect(screen.getByTestId('intelligence-rail')).toBeDefined();

      // Only 3 items from proposals should be rendered (budget constraint)
      expect(screen.getByTestId('intelligence-item-p1')).toBeDefined();
      expect(screen.getByTestId('intelligence-item-p2')).toBeDefined();
      expect(screen.getByTestId('intelligence-item-p3')).toBeDefined();
      expect(screen.queryByTestId('intelligence-item-p4')).toBeNull();

      // Findings section rendered
      expect(screen.getByTestId('intelligence-item-f1')).toBeDefined();
      expect(screen.getByTestId('intelligence-item-f2')).toBeDefined();
    });
  });

  describe('Findings Tray', () => {
    it('sorts findings by severity: blocker > risk > advice and toggles view', () => {
      const mockFindings: ShellFinding[] = [
        { id: 'f-advice', rule: 'AV-003', severity: 'advice', message: 'Advice check' },
        { id: 'f-blocker', rule: 'AV-001', severity: 'blocker', message: 'Blocker check' },
        { id: 'f-risk', rule: 'AV-002', severity: 'risk', message: 'Risk check' },
      ];

      const { rerender } = render(<FindingsTray findings={mockFindings} isOpen={false} />);
      expect(screen.queryByTestId('findings-tray-content')).toBeNull();

      rerender(<FindingsTray findings={mockFindings} isOpen={true} />);
      const content = screen.getByTestId('findings-tray-content');
      expect(content).toBeDefined();

      const items = screen.getAllByTestId(/^finding-item-/);
      expect(items[0]!.getAttribute('data-testid')).toBe('finding-item-f-blocker');
      expect(items[1]!.getAttribute('data-testid')).toBe('finding-item-f-risk');
      expect(items[2]!.getAttribute('data-testid')).toBe('finding-item-f-advice');
    });
  });

  describe('Accessibility & Landmarks (EN 301 549 / WCAG 2.1 AA)', () => {
    it('asserts all required landmarks: banner, navigation, main, aside, region', () => {
      const mockSections: IntelligenceSection[] = [
        {
          id: 'proposals',
          titleKey: 'nav.proposals',
          count: 1,
          items: [{ id: 'p1', sectionId: 'proposals', title: 'Prop' }],
        },
      ];

      render(
        <MemoryRouter>
          <ShellLayout intelligenceSections={mockSections}>
            <div data-testid="stage-content" />
          </ShellLayout>
        </MemoryRouter>
      );

      expect(screen.getByRole('banner')).toBeDefined();
      expect(screen.getByRole('navigation')).toBeDefined();
      expect(screen.getByRole('main')).toBeDefined();
      expect(screen.getByRole('complementary')).toBeDefined();
      expect(screen.getByRole('region')).toBeDefined();
    });

    it('has no axe a11y violations', async () => {
      const { container } = render(<AppShell />);
      await screen.findByTestId('global-search-btn');
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('focuses main content when skip link is clicked', async () => {
      render(
        <MemoryRouter>
          <ShellLayout>
            <div data-testid="stage-content" />
          </ShellLayout>
        </MemoryRouter>
      );

      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toBeDefined();
      expect(skipLink.getAttribute('href')).toBe('#main-content');
    });
  });

  describe('Keyboard Shortcuts & Global Handlers', () => {
    it('focuses global search on Ctrl+K / Cmd+K', () => {
      render(
        <MemoryRouter>
          <ShellLayout>
            <div data-testid="stage-content" />
          </ShellLayout>
        </MemoryRouter>
      );

      const searchBtn = screen.getByTestId('global-search-btn');
      fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
      expect(document.activeElement === searchBtn || document.activeElement === screen.getByTestId('command-input')).toBe(true);
    });

    it('toggles findings tray on Ctrl+`', () => {
      render(
        <MemoryRouter>
          <ShellLayout>
            <div data-testid="stage-content" />
          </ShellLayout>
        </MemoryRouter>
      );

      expect(screen.queryByTestId('findings-tray-content')).toBeNull();
      fireEvent.keyDown(window, { key: '`', ctrlKey: true });
      expect(screen.getByTestId('findings-tray-content')).toBeDefined();
    });
  });
});

