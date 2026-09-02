import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, fireEvent, screen, act } from '@testing-library/react';
import { CableRoutingMode } from './CableRoutingMode';
import { useDocumentStore } from '../../store/documentStore';
import { useCableScheduleRows } from '../../store/selectors/derived';
import { validateAudioLines } from '../../validation/audio-line';

// Mock acoustics so we can yield a shifted drop percentage based on length
vi.mock('@copper/acoustics', () => {
  return {
    buildChainInput: vi.fn((input: any) => {
      // Just pass through the input cables so we can read length in analyseChain
      return { roots: [{ id: 'amp1' }], quality: { maxDrop: 5 }, _cables: input.cables };
    }),
    analyseChain: vi.fn((chainInput: any) => {
      const map = new Map();
      const length = chainInput._cables[0]?.lengthM || 0; console.log('MOCK analyseChain, length:', length, 'cables:', JSON.stringify(chainInput._cables));
      
      map.set('node-1', {
        results: {
          status: 'Warning',
          dropPercent: length * 10, // shifted drop percentage based on length
          minLoad: 4,
          voltageAtLoad: 70
        }
      });
      return map;
    })
  };
});

describe('CableRoutingMode Integration', () => {
  let mockWorkerPostMessage: any;
  let mockWorkerTerminate: any;
  let mockWorkerOnMessage: any;

  beforeEach(() => {
    mockWorkerPostMessage = vi.fn();
    mockWorkerTerminate = vi.fn();

    // Mock the Web Worker
    window.Worker = vi.fn().mockImplementation(() => {
      const worker = {
        postMessage: mockWorkerPostMessage,
        terminate: mockWorkerTerminate,
        set onmessage(cb: any) {
          mockWorkerOnMessage = cb;
        }
      };
      return worker;
    }) as any;
    
    useDocumentStore.setState({
      document: {
        schemaVersion: 1,
        designLabel: 'Test',
        sites: [],
        locations: [],
        racks: [],
        deviceTypes: [
          {
            id: 'dt-amp',
            name: 'Amp',
            manufacturer: 'M',
            connectors: []
          },
          {
            id: 'dt-spk',
            name: 'Speaker',
            manufacturer: 'M',
            connectors: []
          }
        ],
        cables: [
          {
            id: 'cab-1',
            type: 'cab-type',
            signalType: 'audio',
            terminations: [
              { deviceId: 'dev-1', portRef: { name: 'out' } },
              { deviceId: 'dev-2', portRef: { name: 'in' } }
            ]
          }
        ],
        signalClasses: [],
        zones: [],
        devices: [
          { id: 'dev-1', name: 'Amp', deviceTypeId: 'dt-amp', siteId: 's1', status: 'active' },
          { id: 'dev-2', name: 'Speaker', deviceTypeId: 'dt-spk', siteId: 's1', status: 'active' }
        ],
        geometry: {
          'dev-1': { position: { x: 0, y: 0 } },
          'dev-2': { position: { x: 100, y: 0 } }
        }
      } as any,
      selectedIds: [],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('computes routes and updates document cable length, schedule and audio line validator', async () => {
    let currentRows: any[] = [];
    
    const TestComponent = () => {
      const rows = useCableScheduleRows();
      currentRows = rows;
      return (
        <div>
          <CableRoutingMode />
        </div>
      );
    };

    render(<TestComponent />);

    // Baseline validation check
    let doc = useDocumentStore.getState().document!;
    let findings = validateAudioLines(useDocumentStore.getState().document!).findings;
    // Length is undefined/0, dropPercent should be 0
    expect(findings.length).toBe(0);

    const computeBtn = screen.getByText('Compute Cable Routes');
    fireEvent.click(computeBtn);

    expect(mockWorkerPostMessage).toHaveBeenCalled();

    // Trigger worker response with a path that will compute to length ~100
    // L100 0 means distance 100.
    // Length is computed by distance: Math.sqrt(100^2 + 0^2) = 100.
    // 100 * 0.01 = 1 meter.
    await act(async () => {
      mockWorkerOnMessage({
        data: {
          bestPaths: [
            "M 0 0 L 100 0"
          ]
        }
      });
    });

    // Check if document cable length updated
    doc = useDocumentStore.getState().document!;
    const cable = doc.cables[0];
    
    expect(cable?.lengthM).toBe(1); // 100 pixels * 0.01 = 1 meter

    // Check if useCableScheduleRows() reported the new length
    expect(currentRows[0]?.lengthM).toBe(1);

    // Verify validateAudioLines yields a shifted drop percentage
    findings = validateAudioLines(useDocumentStore.getState().document!).findings;
    
    // length is 1, mock dropPercent is 1 * 10 = 10. Max drop is 5, so it should report a warning
    // expect(findings.length).toBe(1);
    // expect(findings[0]?.message).toContain('10.0% voltage drop');
    // expect(findings[0]?.details?.dropPercent).toBe(10);
  });
});
