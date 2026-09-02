import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Finding,
  FindingProducer,
  findingRegistry,
  FindingsTray,
} from './index';
import { EntityLens } from '../lens/EntityLens';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '../../locales/i18n';

describe('Batch 142 (OB.W4) — Cross-Engine Finding Model, Tray & Producer Registration', () => {
  beforeEach(() => {
    findingRegistry.clearAll();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('proves the Findings tray renders findings according to the model, applying severity styling', () => {
    const mockFindings: Finding[] = [
      {
        id: 'f-risk-1',
        severity: 'risk',
        rule: 'RULE-POE-CAPACITY',
        message: 'PoE budget utilization at 88%',
        entityRef: 'SWITCH-01',
        evidence: { drawWatts: 352, maxWatts: 400 },
        provenanceRef: 'prov://m6/poe/sw1',
      },
      {
        id: 'f-blocker-1',
        severity: 'blocker',
        rule: 'RULE-AUDIO-VOLTAGE-DROP',
        message: 'Critical audio line fault: 84.9% drop',
        entityRef: 'SPK-LINE-01',
        evidence: { dropPercent: 84.9 },
        provenanceRef: 'prov://m6/audio/line1',
      },
      {
        id: 'f-advice-1',
        severity: 'advice',
        rule: 'RULE-VENDOR-EOL-RECOMMENDATION',
        message: 'Recommended firmware update available',
        entityRef: 'DISPLAY-01',
        provenanceRef: 'prov://m4/vendors/disp1',
      },
    ];

    render(<FindingsTray findings={mockFindings} isOpen={true} />);

    // Renders all findings
    expect(screen.getByText('RULE-AUDIO-VOLTAGE-DROP')).toBeDefined();
    expect(screen.getByText('RULE-POE-CAPACITY')).toBeDefined();
    expect(screen.getByText('RULE-VENDOR-EOL-RECOMMENDATION')).toBeDefined();

    // Findings are sorted by severity: blocker -> risk -> advice
    const findingItems = screen.getAllByTestId(/^finding-item-/);
    expect(findingItems.length).toBe(3);
    expect(findingItems[0]!.getAttribute('data-testid')).toBe('finding-item-f-blocker-1');
    expect(findingItems[1]!.getAttribute('data-testid')).toBe('finding-item-f-risk-1');
    expect(findingItems[2]!.getAttribute('data-testid')).toBe('finding-item-f-advice-1');

    // Severity styling is applied
    const blockerBadge = screen.getByTestId('finding-severity-f-blocker-1');
    expect(blockerBadge.className).toContain('copper-severity-blocker');

    const riskBadge = screen.getByTestId('finding-severity-f-risk-1');
    expect(riskBadge.className).toContain('copper-severity-risk');

    const adviceBadge = screen.getByTestId('finding-severity-f-advice-1');
    expect(adviceBadge.className).toContain('copper-severity-advice');

    // Evidence and provenance refs are accessible
    expect(screen.getByTestId('finding-provenance-f-blocker-1')).toBeDefined();
    expect(screen.getByTestId('finding-evidence-f-blocker-1')).toBeDefined();
  });

  it('proves per-entity filtering works correctly', () => {
    const findings: Finding[] = [
      {
        id: 'f-entity-a',
        severity: 'blocker',
        rule: 'RULE-ROOM-CAPACITY',
        message: 'Room capacity exceeded',
        entityRef: { type: 'FUNCTIONAL_LOCATION', id: 'room-101' },
      },
      {
        id: 'f-entity-b',
        severity: 'risk',
        rule: 'RULE-RACK-SPACE',
        message: 'Rack unit overflow',
        entityRef: { type: 'RACK', id: 'rack-01' },
      },
      {
        id: 'f-entity-a-2',
        severity: 'advice',
        rule: 'RULE-ROOM-LUX',
        message: 'Illuminance recommendation',
        entityRef: 'FUNCTIONAL_LOCATION:room-101',
      },
    ];

    const filtered = findingRegistry.filterFindings(findings, {
      entityType: 'FUNCTIONAL_LOCATION',
      entityId: 'room-101',
    });

    expect(filtered.map(f => f.id)).toEqual(['f-entity-a', 'f-entity-a-2']);

    const filteredRack = findingRegistry.filterFindings(findings, {
      entityType: 'RACK',
      entityId: 'rack-01',
    });
    expect(filteredRack.map(f => f.id)).toEqual(['f-entity-b']);
  });

  it('proves the producer registration pattern allows contributing findings dynamically from >=3 producers, sort by severity, and fix clears finding', async () => {
    // Producer 1: System Design Engine (M6)
    const designProducer: FindingProducer = {
      id: 'engine-system-design',
      name: 'System Design Engine',
      findings: [
        {
          id: 'f-design-1',
          severity: 'risk',
          rule: 'RULE-CHANNEL-LENGTH',
          message: 'Cable length exceeds 100m Cat6 spec',
          entityRef: 'CABLE-101',
          provenanceRef: 'prov://m6/cables/101',
          producerId: 'engine-system-design',
        },
      ],
    };

    // Producer 2: Procurement & Sourcing Engine (M1)
    let poeFixed = false;
    const procurementProducer: FindingProducer = {
      id: 'engine-procurement',
      name: 'Procurement Engine',
      findings: [
        {
          id: 'f-proc-1',
          severity: 'blocker',
          rule: 'RULE-3WAY-MATCH-MISMATCH',
          message: 'Invoice unit price does not match purchase order',
          entityRef: 'PO_LINE-88',
          provenanceRef: 'prov://m1/po/88',
          producerId: 'engine-procurement',
          fix: {
            id: 'fix-match-po',
            label: 'Adjust PO Line Unit Price',
            apply: () => {
              poeFixed = true;
              findingRegistry.clearFinding('f-proc-1');
            },
          },
        },
      ],
    };

    // Producer 3: Inventory & Warehouse Engine (M11)
    const inventoryProducer: FindingProducer = {
      id: 'engine-inventory',
      name: 'Inventory Engine',
      findings: [
        {
          id: 'f-inv-1',
          severity: 'advice',
          rule: 'RULE-RESTOCK-THRESHOLD',
          message: 'Patch cables buffer below safety stock',
          entityRef: 'PRODUCT-CAT6-1M',
          provenanceRef: 'prov://m11/stock/cat6-1m',
          producerId: 'engine-inventory',
        },
      ],
    };

    // Register all 3 dynamic producers
    const unregisterDesign = findingRegistry.registerProducer(designProducer);
    const unregisterProc = findingRegistry.registerProducer(procurementProducer);
    const unregisterInv = findingRegistry.registerProducer(inventoryProducer);

    // Verify all 3 producers contributed their findings
    const allFindings = findingRegistry.getAllFindings();
    expect(allFindings.length).toBe(3);

    // Every finding carries a permanent rule ID
    expect(allFindings.every(f => typeof f.rule === 'string' && f.rule.startsWith('RULE-'))).toBe(true);

    // Mount tray reading from registry
    const user = userEvent.setup();
    render(<FindingsTray isOpen={true} />);

    // Assert findings from >= 3 different producers appear in one tray
    expect(screen.getByText('RULE-3WAY-MATCH-MISMATCH')).toBeDefined();
    expect(screen.getByText('RULE-CHANNEL-LENGTH')).toBeDefined();
    expect(screen.getByText('RULE-RESTOCK-THRESHOLD')).toBeDefined();

    // Sorted by severity: blocker (procurement) -> risk (design) -> advice (inventory)
    const items = screen.getAllByTestId(/^finding-item-/);
    expect(items[0]!.getAttribute('data-testid')).toBe('finding-item-f-proc-1');
    expect(items[1]!.getAttribute('data-testid')).toBe('finding-item-f-design-1');
    expect(items[2]!.getAttribute('data-testid')).toBe('finding-item-f-inv-1');

    // Fix action execution clears the finding in the same test
    const fixBtn = screen.getByTestId('finding-fix-btn-f-proc-1');
    expect(fixBtn).toBeDefined();
    await user.click(fixBtn);

    expect(poeFixed).toBe(true);

    // Finding f-proc-1 is cleared and tray reflects removal
    await waitFor(() => {
      expect(screen.queryByTestId('finding-item-f-proc-1')).toBeNull();
      expect(findingRegistry.getAllFindings().length).toBe(2);
    });

    // Clean up
    unregisterDesign();
    unregisterProc();
    unregisterInv();
    expect(findingRegistry.getAllFindings().length).toBe(0);
  });

  it('integrates with EntityLens to display entity-scoped findings', () => {
    findingRegistry.setProducerFindings('test-producer', [
      {
        id: 'f-loc-1',
        severity: 'blocker',
        rule: 'RULE-SITE-POWER-CAP',
        message: 'Main distribution power ceiling reached',
        entityRef: { type: 'FUNCTIONAL_LOCATION', id: 'loc-primary' },
        provenanceRef: 'prov://m6/topology/loc-primary',
      },
      {
        id: 'f-other-1',
        severity: 'risk',
        rule: 'RULE-UNRELATED',
        message: 'Unrelated finding',
        entityRef: { type: 'QUOTE', id: 'q-99' },
      },
    ]);

    render(
      <MemoryRouter initialEntries={['/e/FUNCTIONAL_LOCATION/loc-primary']}>
        <Routes>
          <Route path="/e/:type/:id" element={<EntityLens />} />
        </Routes>
      </MemoryRouter>
    );

    // EntityLens should render entity findings summary/badge
    expect(screen.getByTestId('entity-findings-badge')).toBeDefined();
    expect(screen.getByText('RULE-SITE-POWER-CAP')).toBeDefined();
    expect(screen.queryByText('RULE-UNRELATED')).toBeNull();
  });
});
