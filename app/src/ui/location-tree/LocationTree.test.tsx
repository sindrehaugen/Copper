import { render, screen, within, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { expect, test, describe, beforeEach, vi, afterEach } from 'vitest';
import { LocationTree } from './LocationTree';
import { DesignDocument } from '../../model/schema';
import { findingRegistry, Finding } from '../../shell/finding';

describe('LocationTree (SP.W1 / Batch 155)', () => {
  const mockDoc: DesignDocument = {
    schemaVersion: 1,
    designLabel: 'Test Design',
    sites: [
      { id: 's1', name: 'Site 1', slug: 'site-1' }
    ],
    locations: [
      { id: 'l1', name: 'Building A', slug: 'bldg-a', siteId: 's1' },
      { id: 'l2', name: 'Building B', slug: 'bldg-b', siteId: 's1' },
      { id: 'l3', name: 'Floor 1', slug: 'fl-1', siteId: 's1', parentId: 'l1' },
      { id: 'l4', name: 'Room 101', slug: 'rm-101', siteId: 's1', parentId: 'l3' },
      { id: 'l5', name: 'Rack Position 1', slug: 'pos-1', siteId: 's1', parentId: 'l4' }
    ],
    racks: [
      { id: 'r1', name: 'Rack 1', siteId: 's1', locationId: 'l4', uHeight: 42, status: 'active' }
    ],
    deviceTypes: [],
    devices: [
      { id: 'd1', name: 'Core Switch', siteId: 's1', locationId: 'l4', deviceTypeId: 'dt1', status: 'active' },
      { id: 'd2', name: 'Position Sensor', siteId: 's1', locationId: 'l5', deviceTypeId: 'dt2', status: 'active' }
    ],
    cables: [],
    signalClasses: []
  } as unknown as DesignDocument;

  beforeEach(() => {
    findingRegistry.clearAll();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
    findingRegistry.clearAll();
    vi.restoreAllMocks();
  });

  test('Component correctly nests Locations under Sites and Locations under parent Locations', () => {
    render(<LocationTree document={mockDoc} />);

    // Assert top-level tree exists
    const tree = screen.getByTestId('location-tree');
    expect(tree).toBeDefined();

    // Assert Site 1 is rendered
    const site1 = screen.getByTestId('site-s1');
    expect(site1.textContent).toContain('Site 1');

    // Assert Root Locations are under Site 1
    const site1LocationsList = within(site1).getByTestId('site-locations-s1');
    expect(site1LocationsList.children.length).toBe(2);

    const loc1 = within(site1LocationsList).getByTestId('location-l1');
    const loc2 = within(site1LocationsList).getByTestId('location-l2');
    expect(loc1).toBeDefined();
    expect(loc2).toBeDefined();

    // Assert nested location (Floor 1) is under Building A
    const loc1ChildrenList = within(loc1).getByTestId('location-children-l1');
    expect(loc1ChildrenList.children.length).toBe(1);

    const loc3 = within(loc1ChildrenList).getByTestId('location-l3');
    expect(loc3).toBeDefined();

    // Assert loc2 has no children list
    const loc2ChildrenList = within(loc2).queryByTestId('location-children-l2');
    expect(loc2ChildrenList).toBeNull();
  });

  test('Tree fetches and renders Site > Building > Floor > Room > Position hierarchy from GET /api/system-design/topology endpoint', async () => {
    const topologyPayload = {
      functional_locations: [
        { id: 'site-nordic', name: 'Oslo Campus', slug: 'oslo' },
        { id: 'bldg-1', name: 'Building 1', slug: 'bldg-1', siteId: 'site-nordic' },
        { id: 'floor-2', name: 'Floor 2', slug: 'fl-2', siteId: 'site-nordic', parentId: 'bldg-1' },
        { id: 'room-204', name: 'Conference Room 204', slug: 'cr-204', siteId: 'site-nordic', parentId: 'floor-2' },
        { id: 'pos-podium', name: 'Podium AV Box', slug: 'pos-podium', siteId: 'site-nordic', parentId: 'room-204' }
      ],
      devices: [
        { node: { id: 'dev-codec', name: 'Cisco Codec Pro', siteId: 'site-nordic', locationId: 'room-204' } }
      ],
      racks: [
        { node: { id: 'rack-01', name: 'AV Rack 01', siteId: 'site-nordic', locationId: 'room-204', uHeight: 24 } }
      ]
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => topologyPayload
    });
    global.fetch = fetchMock as any;

    render(<LocationTree namespaceId="tenant-alpha" />);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/system-design/topology')
    );

    // Wait for the tree to load and render hierarchy
    await waitFor(() => {
      expect(screen.getByTestId('location-bldg-1')).toBeDefined();
    });

    const siteNode = screen.getByTestId('site-site-nordic');
    expect(siteNode.textContent).toContain('Oslo Campus');

    const bldgNode = screen.getByTestId('location-bldg-1');
    expect(bldgNode.textContent).toContain('Building 1');

    const floorNode = screen.getByTestId('location-floor-2');
    expect(floorNode.textContent).toContain('Floor 2');

    const roomNode = screen.getByTestId('location-room-204');
    expect(roomNode.textContent).toContain('Conference Room 204');

    const posNode = screen.getByTestId('location-pos-podium');
    expect(posNode.textContent).toContain('Podium AV Box');

    // Entity count assertions
    const roomEntityCount = screen.getByTestId('entity-count-room-204');
    expect(roomEntityCount).toBeDefined();
    expect(roomEntityCount.textContent).toMatch(/2/); // 1 device + 1 rack
  });

  test('Tree provides full keyboard navigation (ArrowDown, ArrowRight to expand, ArrowLeft to collapse, ArrowUp, Home, End, Space)', async () => {
    const onSelectNode = vi.fn();
    render(<LocationTree document={mockDoc} onSelectNode={onSelectNode} />);

    const tree = screen.getByTestId('location-tree');
    expect(tree).toBeDefined();

    // Find the root site item
    const siteItem = screen.getByTestId('site-s1');
    siteItem.focus();

    // Collapse site using ArrowLeft
    fireEvent.keyDown(siteItem, { key: 'ArrowLeft', code: 'ArrowLeft' });
    await waitFor(() => {
      expect(siteItem.getAttribute('aria-expanded')).toBe('false');
      expect(screen.queryByTestId('site-locations-s1')).toBeNull();
    });

    // Expand site using ArrowRight
    fireEvent.keyDown(siteItem, { key: 'ArrowRight', code: 'ArrowRight' });
    await waitFor(() => {
      expect(siteItem.getAttribute('aria-expanded')).toBe('true');
      expect(screen.getByTestId('site-locations-s1')).toBeDefined();
    });

    // ArrowDown moves focus to Building A (l1)
    fireEvent.keyDown(siteItem, { key: 'ArrowDown', code: 'ArrowDown' });
    await waitFor(() => {
      const loc1 = screen.getByTestId('location-l1');
      expect(document.activeElement === loc1 || loc1.getAttribute('tabindex') === '0').toBe(true);
    });

    // ArrowDown moves focus to Floor 1 (l3, child of l1)
    const loc1 = screen.getByTestId('location-l1');
    fireEvent.keyDown(loc1, { key: 'ArrowDown', code: 'ArrowDown' });
    await waitFor(() => {
      const loc3 = screen.getByTestId('location-l3');
      expect(document.activeElement === loc3 || loc3.getAttribute('tabindex') === '0').toBe(true);
    });

    // ArrowUp moves focus back up to Building A (l1)
    const loc3 = screen.getByTestId('location-l3');
    fireEvent.keyDown(loc3, { key: 'ArrowUp', code: 'ArrowUp' });
    await waitFor(() => {
      const loc1After = screen.getByTestId('location-l1');
      expect(document.activeElement === loc1After || loc1After.getAttribute('tabindex') === '0').toBe(true);
    });

    // End key moves focus to last visible item (Building B / l2)
    fireEvent.keyDown(loc1, { key: 'End', code: 'End' });
    await waitFor(() => {
      const loc2 = screen.getByTestId('location-l2');
      expect(document.activeElement === loc2 || loc2.getAttribute('tabindex') === '0').toBe(true);
    });

    // Home key moves focus to first item (Site 1 / s1)
    const loc2 = screen.getByTestId('location-l2');
    fireEvent.keyDown(loc2, { key: 'Home', code: 'Home' });
    await waitFor(() => {
      expect(document.activeElement === siteItem || siteItem.getAttribute('tabindex') === '0').toBe(true);
    });

    // Space key activates selected node
    fireEvent.keyDown(siteItem, { key: ' ', code: 'Space' });
    expect(onSelectNode).toHaveBeenCalledWith(
      expect.objectContaining({ id: 's1', type: 'site' })
    );
  });

  test('Tree renders finding badges on nodes that have active findings from B142 model', async () => {
    // Register active findings for l4 (Room 101) and s1 (Site 1)
    const mockFinding1: Finding = {
      id: 'f-1',
      severity: 'blocker',
      rule: 'RULE_AUDIO_DSP_CLIPPING',
      message: 'DSP headroom exceeded',
      entityRef: { type: 'FUNCTIONAL_LOCATION', id: 'l4' }
    };

    const mockFinding2: Finding = {
      id: 'f-2',
      severity: 'risk',
      rule: 'RULE_POE_BUDGET_WARNING',
      message: 'PoE power budget at 92%',
      entityRef: 'FUNCTIONAL_LOCATION:s1'
    };

    findingRegistry.registerProducer({
      id: 'test-producer',
      findings: [mockFinding1, mockFinding2]
    });

    render(<LocationTree document={mockDoc} />);

    // Check finding badge on Room 101 (l4)
    const roomBadge = await screen.findByTestId('finding-badge-l4');
    expect(roomBadge).toBeDefined();
    expect(roomBadge.textContent).toContain('1');
    expect(roomBadge.className).toContain('blocker');

    // Check finding badge on Site 1 (s1)
    const siteBadge = await screen.findByTestId('finding-badge-s1');
    expect(siteBadge).toBeDefined();
    expect(siteBadge.textContent).toContain('1');
    expect(siteBadge.className).toContain('risk');

    // Node without findings (l2) has no finding badge
    expect(screen.queryByTestId('finding-badge-l2')).toBeNull();
  });

  test('Clicking a node navigates to /e/FUNCTIONAL_LOCATION/:id entity lens', async () => {
    const onNavigate = vi.fn();
    const onSelectNode = vi.fn();

    render(
      <LocationTree
        document={mockDoc}
        onNavigate={onNavigate}
        onSelectNode={onSelectNode}
      />
    );

    // Find link for Building A (l1)
    const loc1Link = screen.getByTestId('node-link-l1');
    expect(loc1Link.getAttribute('href')).toBe('/e/FUNCTIONAL_LOCATION/l1');

    // Click link
    fireEvent.click(loc1Link);

    expect(onNavigate).toHaveBeenCalledWith('/e/FUNCTIONAL_LOCATION/l1');
    expect(onSelectNode).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'l1', name: 'Building A' })
    );

    // Clicking site link navigates to /e/FUNCTIONAL_LOCATION/s1
    const siteLink = screen.getByTestId('node-link-s1');
    expect(siteLink.getAttribute('href')).toBe('/e/FUNCTIONAL_LOCATION/s1');

    fireEvent.click(siteLink);
    expect(onNavigate).toHaveBeenCalledWith('/e/FUNCTIONAL_LOCATION/s1');
  });

  test('Clicking the expander icon toggles subtree collapse and expand', async () => {
    render(<LocationTree document={mockDoc} />);

    const expanderL1 = screen.getByTestId('expander-l1');
    expect(screen.getByTestId('location-children-l1')).toBeDefined();

    // Click to collapse
    fireEvent.click(expanderL1);
    await waitFor(() => {
      expect(screen.queryByTestId('location-children-l1')).toBeNull();
    });

    // Click to expand
    fireEvent.click(expanderL1);
    await waitFor(() => {
      expect(screen.getByTestId('location-children-l1')).toBeDefined();
    });
  });

  test('Renders error state when topology fetch fails', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('Network error 500'));
    global.fetch = fetchMock as any;

    render(<LocationTree namespaceId="tenant-beta" />);

    await waitFor(() => {
      const errorElem = screen.getByTestId('location-tree-error');
      expect(errorElem.textContent).toContain('Network error 500');
    });
  });
});
