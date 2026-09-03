import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { EstateMap, type EstateSite, type EstateBuilding } from './EstateMap';
import { EntityLens } from '../../shell/lens/EntityLens';
import { findingRegistry, type Finding } from '../../shell/finding';
import '../../locales/i18n';

describe('EstateMap (Batch 161 / SP.W7)', () => {
  const mockSites: EstateSite[] = [
    {
      id: 'site-nordic-01',
      name: 'Nordic Operations Hub',
      coordinates: [10.7522, 59.9139],
      polygon: [
        [10.751, 59.913],
        [10.753, 59.913],
        [10.753, 59.915],
        [10.751, 59.915],
      ],
    },
    {
      id: 'site-bergen-02',
      name: 'Bergen Data Center',
      coordinates: [5.3221, 60.3913],
    },
  ];

  const mockBuildings: EstateBuilding[] = [
    {
      id: 'bldg-alpha',
      siteId: 'site-nordic-01',
      name: 'Building Alpha - Core Ops',
      coordinates: [10.7525, 59.9142],
      polygon: [
        [10.752, 59.914],
        [10.753, 59.914],
        [10.753, 59.9145],
        [10.752, 59.9145],
      ],
    },
    {
      id: 'bldg-beta',
      siteId: 'site-nordic-01',
      name: 'Building Beta - Lab & Storage',
      coordinates: [10.7518, 59.9135],
    },
  ];

  beforeEach(() => {
    findingRegistry.clearAll();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
    findingRegistry.clearAll();
    vi.restoreAllMocks();
  });

  it('mounts the MapLibre component and renders markers for the provided sites/buildings', () => {
    render(
      <EstateMap
        sites={mockSites}
        buildings={mockBuildings}
      />
    );

    // MapLibre container component must be mounted
    const mapContainer = screen.getByTestId('maplibre-container');
    expect(mapContainer).toBeDefined();
    expect(mapContainer.getAttribute('data-mounted')).toBe('true');

    // Markers must be rendered for sites
    const siteMarker1 = screen.getByTestId('map-marker-site-nordic-01');
    expect(siteMarker1).toBeDefined();
    expect(siteMarker1.textContent).toContain('Nordic Operations Hub');
    expect(siteMarker1.getAttribute('data-entity-type')).toBe('site');

    const siteMarker2 = screen.getByTestId('map-marker-site-bergen-02');
    expect(siteMarker2).toBeDefined();
    expect(siteMarker2.textContent).toContain('Bergen Data Center');

    // Markers must be rendered for buildings
    const bldgMarkerAlpha = screen.getByTestId('map-marker-bldg-alpha');
    expect(bldgMarkerAlpha).toBeDefined();
    expect(bldgMarkerAlpha.textContent).toContain('Building Alpha - Core Ops');
    expect(bldgMarkerAlpha.getAttribute('data-entity-type')).toBe('building');

    const bldgMarkerBeta = screen.getByTestId('map-marker-bldg-beta');
    expect(bldgMarkerBeta).toBeDefined();
    expect(bldgMarkerBeta.textContent).toContain('Building Beta - Lab & Storage');
  });

  it('renders polygons for sites and buildings with polygon geometry', () => {
    render(
      <EstateMap
        sites={mockSites}
        buildings={mockBuildings}
      />
    );

    // Polygon for site-nordic-01
    const sitePolygon = screen.getByTestId('map-polygon-site-nordic-01');
    expect(sitePolygon).toBeDefined();
    expect(sitePolygon.getAttribute('data-polygon-type')).toBe('site');

    // Polygon for bldg-alpha
    const bldgPolygon = screen.getByTestId('map-polygon-bldg-alpha');
    expect(bldgPolygon).toBeDefined();
    expect(bldgPolygon.getAttribute('data-polygon-type')).toBe('building');

    // Entity without polygon does not render a polygon layer
    expect(screen.queryByTestId('map-polygon-site-bergen-02')).toBeNull();
  });

  it('health and SLA rollups correctly color or label the markers based on mocked findings', () => {
    // 1. Blocker on Building Alpha -> should color red (critical / blocker)
    const blockerFinding: Finding = {
      id: 'f-bldg-critical',
      severity: 'blocker',
      rule: 'RULE_HVAC_SLA_BREACH',
      message: 'Temperature threshold exceeded 35C in Server Room 1',
      entityRef: { type: 'FUNCTIONAL_LOCATION', id: 'bldg-alpha' },
    };

    // 2. Risk on Building Beta -> should color amber/warning (risk)
    const riskFinding: Finding = {
      id: 'f-bldg-risk',
      severity: 'risk',
      rule: 'RULE_POE_BUDGET_WARNING',
      message: 'PoE power budget nearing capacity',
      entityRef: { type: 'FUNCTIONAL_LOCATION', id: 'bldg-beta' },
    };

    findingRegistry.registerProducer({
      id: 'test-estate-findings',
      findings: [blockerFinding, riskFinding],
    });

    render(
      <EstateMap
        sites={mockSites}
        buildings={mockBuildings}
      />
    );

    // Building Alpha marker has blocker -> critical health status
    const markerAlpha = screen.getByTestId('map-marker-bldg-alpha');
    expect(markerAlpha.getAttribute('data-health')).toBe('critical');
    expect(markerAlpha.getAttribute('data-severity')).toBe('blocker');
    expect(markerAlpha.getAttribute('data-sla-status')).toBe('breached');
    expect(markerAlpha.getAttribute('data-findings-count')).toBe('1');
    const badgeAlpha = screen.getByTestId('marker-health-badge-bldg-alpha');
    expect(badgeAlpha.textContent).toContain('critical');

    // Building Beta marker has risk -> warning health status
    const markerBeta = screen.getByTestId('map-marker-bldg-beta');
    expect(markerBeta.getAttribute('data-health')).toBe('warning');
    expect(markerBeta.getAttribute('data-severity')).toBe('risk');
    expect(markerBeta.getAttribute('data-findings-count')).toBe('1');
    const badgeBeta = screen.getByTestId('marker-health-badge-bldg-beta');
    expect(badgeBeta.textContent).toContain('warning');

    // Site 1 contains Building Alpha (blocker) -> rolled up health is critical
    const markerSite1 = screen.getByTestId('map-marker-site-nordic-01');
    expect(markerSite1.getAttribute('data-health')).toBe('critical');

    // Site 2 has no findings -> healthy
    const markerSite2 = screen.getByTestId('map-marker-site-bergen-02');
    expect(markerSite2.getAttribute('data-health')).toBe('healthy');
    expect(markerSite2.getAttribute('data-findings-count')).toBe('0');
  });

  it('clicking a site or building marker navigates to that entity in room tree or Lens', () => {
    const onNavigate = vi.fn();
    const onSelectEntity = vi.fn();

    render(
      <EstateMap
        sites={mockSites}
        buildings={mockBuildings}
        onNavigate={onNavigate}
        onSelectEntity={onSelectEntity}
      />
    );

    // Click site marker
    const siteMarker = screen.getByTestId('map-marker-site-nordic-01');
    fireEvent.click(siteMarker);

    expect(onNavigate).toHaveBeenCalledWith(
      '/e/FUNCTIONAL_LOCATION/site-nordic-01',
      expect.objectContaining({ id: 'site-nordic-01', type: 'site' })
    );
    expect(onSelectEntity).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'site-nordic-01' })
    );

    // Click building marker
    const bldgMarker = screen.getByTestId('map-marker-bldg-alpha');
    fireEvent.click(bldgMarker);

    expect(onNavigate).toHaveBeenCalledWith(
      '/e/FUNCTIONAL_LOCATION/bldg-alpha',
      expect.objectContaining({ id: 'bldg-alpha', type: 'building' })
    );
  });

  it('accepts map style URL and secrets via config without hardcoding provider keys in source (HS-15)', () => {
    const config = {
      styleUrl: 'https://tiles.copper.example.com/styles/dark-nordic.json',
      apiKey: 'custom-secret-key-123',
      tileProvider: 'custom' as const,
    };

    render(
      <EstateMap
        sites={mockSites}
        config={config}
      />
    );

    const mapContainer = screen.getByTestId('maplibre-container');
    expect(mapContainer.getAttribute('data-style-url')).toBe(
      'https://tiles.copper.example.com/styles/dark-nordic.json'
    );
    expect(mapContainer.getAttribute('data-provider')).toBe('custom');
  });

  it('mounts EstateMap in EntityLens when viewing SITE level entity', () => {
    render(
      <MemoryRouter initialEntries={['/e/FUNCTIONAL_LOCATION/site-nordic-01?level=site']}>
        <Routes>
          <Route path="/e/:type/:id" element={<EntityLens />} />
        </Routes>
      </MemoryRouter>
    );

    // EntityLens should render EstateMap for SITE level
    const estateMapEl = screen.getByTestId('estate-map');
    expect(estateMapEl).toBeDefined();
    expect(screen.getByTestId('maplibre-container')).toBeDefined();
  });
});
