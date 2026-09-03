import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SpatialFindingsTray, filterFindingsBySpatialPresence, sortFindingsBySeverity } from './SpatialFindingsTray';
import { findingRegistry } from '../../shell/finding/registry';
import { useDocumentStore } from '../../store/documentStore';
import type { DesignDocument } from '../../model/schema';
import '../../locales/i18n';

describe('Batch 159 (SP.W5) — SpatialFindingsTray Component & Spatial Filtering', () => {
  const mockDocument: DesignDocument = {
    designLabel: 'Spatial Test Design',
    revision: '1',
    sites: [
      { id: 'site-1', name: 'Main Campus', slug: 'main-campus' }
    ],
    locations: [
      { id: 'bldg-1', name: 'Building 1', slug: 'bldg-1', siteId: 'site-1' },
      { id: 'room-a', name: 'Conference Room A', slug: 'room-a', siteId: 'site-1', parentId: 'bldg-1' },
      { id: 'room-b', name: 'Huddle Room B', slug: 'room-b', siteId: 'site-1', parentId: 'bldg-1' }
    ],
    racks: [
      { id: 'rack-a', name: 'Rack A', siteId: 'site-1', locationId: 'room-a', uHeight: 42, status: 'active' },
      { id: 'rack-b', name: 'Rack B', siteId: 'site-1', locationId: 'room-b', uHeight: 42, status: 'active' }
    ],
    deviceTypes: [
      { id: 'dt-amp', manufacturer: 'Acme', model: 'Amp 100', slug: 'amp-100', uHeight: 2, isFullDepth: true },
      { id: 'dt-spk', manufacturer: 'Acme', model: 'Speaker 8', slug: 'spk-8', uHeight: 1, isFullDepth: false }
    ],
    devices: [
      { id: 'dev-amp-a', name: 'Room A Amp', deviceTypeId: 'dt-amp', siteId: 'site-1', locationId: 'room-a', status: 'active' },
      { id: 'dev-spk-a1', name: 'Room A Speaker 1', deviceTypeId: 'dt-spk', siteId: 'site-1', locationId: 'room-a', status: 'active' },
      { id: 'dev-amp-b', name: 'Room B Amp', deviceTypeId: 'dt-amp', siteId: 'site-1', locationId: 'room-b', status: 'active' },
      { id: 'dev-spk-b1', name: 'Room B Speaker 1', deviceTypeId: 'dt-spk', siteId: 'site-1', locationId: 'room-b', status: 'active' }
    ],
    cables: [
      {
        id: 'cab-a1',
        status: 'connected',
        terminations: [
          { deviceId: 'dev-amp-a', portRef: { kind: 'rearPort', name: 'out' } },
          { deviceId: 'dev-spk-a1', portRef: { kind: 'rearPort', name: 'in' } }
        ]
      },
      {
        id: 'cab-b1',
        status: 'connected',
        terminations: [
          { deviceId: 'dev-amp-b', portRef: { kind: 'rearPort', name: 'out' } },
          { deviceId: 'dev-spk-b1', portRef: { kind: 'rearPort', name: 'in' } }
        ]
      }
    ],
    zones: [
      { id: 'zone-a', name: 'Room A Listening Area', locationId: 'room-a', type: 'participant' },
      { id: 'zone-b', name: 'Room B Viewing Area', locationId: 'room-b', type: 'viewer' }
    ]
  };

  const mockGlobalFindings = [
    {
      id: 'f-room-b-err',
      targetId: 'dev-amp-b',
      severity: 'Error',
      rule: 'RULE-POE-BUDGET',
      message: 'Room B Amp PoE overload'
    },
    {
      id: 'f-room-a-info',
      targetId: 'cab-a1',
      severity: 'Info',
      rule: 'RULE-CABLE-LENGTH',
      message: 'Room A cable length suboptimal'
    },
    {
      id: 'f-room-a-err',
      targetId: 'dev-amp-a',
      severity: 'Error',
      rule: 'RULE-VOLTAGE-DROP',
      message: 'Room A Amp critical voltage drop'
    },
    {
      id: 'f-room-a-warn',
      targetId: 'dev-spk-a1',
      severity: 'Warning',
      rule: 'RULE-SPL-MARGIN',
      message: 'Room A Speaker SPL margin low'
    },
    {
      id: 'f-room-b-warn',
      targetId: 'zone-b',
      severity: 'Warning',
      rule: 'RULE-SIGHTLINE',
      message: 'Room B zone obstructed'
    }
  ];

  beforeEach(() => {
    findingRegistry.clearAll();
    useDocumentStore.getState().loadDocument(mockDocument);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('correctly sorts findings by severity (Error > Warning > Info)', () => {
    const sorted = sortFindingsBySeverity(mockGlobalFindings);
    expect(sorted.map(f => f.severity)).toEqual([
      'Error',
      'Error',
      'Warning',
      'Warning',
      'Info'
    ]);
    expect(sorted[0]!.id).toBe('f-room-b-err');
    expect(sorted[1]!.id).toBe('f-room-a-err');
  });

  it('correctly filters global findings to only those physically present in the active space', () => {
    // When active space is Room A
    const roomAFindings = filterFindingsBySpatialPresence(mockGlobalFindings, mockDocument, 'room-a');
    expect(roomAFindings.length).toBe(3);
    expect(roomAFindings.map(f => f.id)).toEqual(
      expect.arrayContaining(['f-room-a-err', 'f-room-a-warn', 'f-room-a-info'])
    );
    expect(roomAFindings.some(f => f.id === 'f-room-b-err')).toBe(false);
    expect(roomAFindings.some(f => f.id === 'f-room-b-warn')).toBe(false);

    // When active space is Room B
    const roomBFindings = filterFindingsBySpatialPresence(mockGlobalFindings, mockDocument, 'room-b');
    expect(roomBFindings.length).toBe(2);
    expect(roomBFindings.map(f => f.id)).toEqual(
      expect.arrayContaining(['f-room-b-err', 'f-room-b-warn'])
    );
  });

  it('renders SpatialFindingsTray and displays only active space findings sorted by severity', async () => {
    render(
      <SpatialFindingsTray
        findings={mockGlobalFindings}
        activeSpaceId="room-a"
        isOpen={true}
      />
    );

    expect(screen.getByTestId('spatial-findings-tray')).toBeDefined();

    // Only Room A items are rendered
    expect(screen.getByText('Room A Amp critical voltage drop')).toBeDefined();
    expect(screen.getByText('Room A Speaker SPL margin low')).toBeDefined();
    expect(screen.getByText('Room A cable length suboptimal')).toBeDefined();
    expect(screen.queryByText('Room B Amp PoE overload')).toBeNull();

    // Severities are sorted: Error -> Warning -> Info
    const items = screen.getAllByTestId(/^spatial-finding-item-/);
    expect(items.length).toBe(3);
    expect(items[0]!.getAttribute('data-testid')).toBe('spatial-finding-item-f-room-a-err');
    expect(items[1]!.getAttribute('data-testid')).toBe('spatial-finding-item-f-room-a-warn');
    expect(items[2]!.getAttribute('data-testid')).toBe('spatial-finding-item-f-room-a-info');
  });

  it('allows selecting an item to update documentStore selectedIds', async () => {
    const user = userEvent.setup();
    render(
      <SpatialFindingsTray
        findings={mockGlobalFindings}
        activeSpaceId="room-a"
        isOpen={true}
      />
    );

    const errorItem = screen.getByTestId('spatial-finding-item-f-room-a-err');
    await user.click(errorItem);

    expect(useDocumentStore.getState().selectedIds).toEqual(['dev-amp-a']);
  });

  it('handles empty findings gracefully for a room with no issues', () => {
    render(
      <SpatialFindingsTray
        findings={[]}
        activeSpaceId="room-a"
        isOpen={true}
      />
    );

    expect(screen.getByTestId('spatial-findings-empty')).toBeDefined();
  });

  it('consumes global findings registry when no explicit findings prop is provided', () => {
    findingRegistry.setProducerFindings('test-producer', [
      {
        id: 'f-reg-1',
        targetId: 'dev-amp-a',
        severity: 'blocker',
        rule: 'RULE-REG-BLOCKER',
        message: 'Registry blocker on Room A Amp'
      }
    ]);

    render(
      <SpatialFindingsTray
        activeSpaceId="room-a"
        isOpen={true}
      />
    );

    expect(screen.getByText('Registry blocker on Room A Amp')).toBeDefined();
  });
});
