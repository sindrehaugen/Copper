// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { NodeInspector } from '../NodeInspector';
import { EdgeInspector } from '../EdgeInspector';
import { useDocumentStore } from '../../../store/documentStore';
import * as audioLine from '../../../validation/audio-line';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}));

vi.mock('../../../validation/audio-line', () => ({
  validateAudioLines: vi.fn(),
  suggestAmpsForNode: vi.fn(),
  suggestCablesForEdge: vi.fn()
}));

const mockDeviceTypes = [
  {
    id: "amp-1",
    manufacturer: "Acme",
    model: "Amp 1",
    customFields: { acoustics: { device_class: "amplifier", min_load: 8, watt_8: 100 } }
  },
  {
    id: "amp-2",
    manufacturer: "Acme",
    model: "Amp 2",
    customFields: { acoustics: { device_class: "amplifier", min_load: 4, watt_8: 200 } }
  },
  {
    id: "spk-1",
    manufacturer: "Acme",
    model: "Speaker 1",
    customFields: { acoustics: { device_class: "speaker", impedance: 4, z_min: 4, type: "Low-Z" } }
  },
  {
    id: "cab-1",
    manufacturer: "Acme",
    model: "Cable 1",
    customFields: { acoustics: { device_class: "cable", resistance: 2.5 } }
  },
  {
    id: "cab-2",
    manufacturer: "Acme",
    model: "Cable 2",
    customFields: { acoustics: { device_class: "cable", resistance: 0.01 } }
  }
];

describe('Inspector Wizards', () => {
  beforeEach(() => {
    useDocumentStore.setState({
      selectedIds: [],
      document: {
        devices: [
          { id: "node-amp", name: "Amp", deviceTypeId: "amp-1", x: 0, y: 0 },
          { id: "node-spk", name: "Speaker", deviceTypeId: "spk-1", x: 10, y: 10 }
        ],
        deviceTypes: mockDeviceTypes,
        cables: [
          {
            id: "edge-1",
            type: "cab-1",
            lengthM: 100,
            terminations: [
              { deviceId: "node-amp", portRef: { kind: 'port', name: 'out1' } },
              { deviceId: "node-spk", portRef: { kind: 'port', name: 'in1' } }
            ]
          }
        ]
      } as any,
      updateDocument: (updater: any) => {
        const state = useDocumentStore.getState();
        const draft = JSON.parse(JSON.stringify(state.document));
        updater(draft);
        useDocumentStore.setState({ document: draft });
      }
    });
  });

  it('NodeInspector applies suggestion and clears finding', () => {
    (audioLine.validateAudioLines as any).mockReturnValue({
      findings: [{ targetId: 'node-spk', severity: 'Error', message: 'Bad load' }]
    });
    (audioLine.suggestAmpsForNode as any).mockReturnValue([mockDeviceTypes[1]]); // amp-2

    // For NodeInspector test, we want an impedance issue that amp-2 fixes.
    const doc = {
      devices: [
        { id: "node-amp", name: "Amp", deviceTypeId: "amp-1", x: 0, y: 0 },
        { id: "node-spk", name: "Speaker", deviceTypeId: "spk-1", x: 10, y: 10 }
      ],
      deviceTypes: mockDeviceTypes,
      cables: []
    } as any;
    useDocumentStore.setState({ selectedIds: ["node-amp"], document: doc });
    
    render(<NodeInspector />);
    
    const swapBtn = screen.getByText(/Swap to Amp 2/i);
    expect(swapBtn).toBeTruthy();
    
    // Once swapped, the finding should clear
    (audioLine.validateAudioLines as any).mockReturnValue({ findings: [] });
    
    fireEvent.click(swapBtn);
    
    const store = useDocumentStore.getState();
    const updatedAmp = store.document.devices.find((d: any) => d.id === 'node-amp');
    expect(updatedAmp?.deviceTypeId).toBe('amp-2');
  });

  it('EdgeInspector applies suggestion and clears finding', () => {
    (audioLine.validateAudioLines as any).mockReturnValue({
      findings: [{ targetId: 'node-spk', severity: 'Error', details: { dropPercent: 25, minLoad: 5 } }]
    });
    (audioLine.suggestCablesForEdge as any).mockReturnValue([mockDeviceTypes[4]]); // cab-2

    const doc = {
      devices: [
        { id: "node-amp", name: "Amp", deviceTypeId: "amp-2", x: 0, y: 0 },
        { id: "node-spk", name: "Speaker", deviceTypeId: "spk-1", x: 10, y: 10 }
      ],
      deviceTypes: mockDeviceTypes,
      cables: [
        {
          id: "edge-1", type: "cab-1", lengthM: 100, // Bad cable
          terminations: [{ deviceId: "node-amp", portRef: { kind: 'port', name: 'out1' } }, { deviceId: "node-spk", portRef: { kind: 'port', name: 'in1' } }]
        }
      ]
    } as any;
    useDocumentStore.setState({ selectedIds: ["edge-1"], document: doc });

    const { rerender } = render(<EdgeInspector />);
    
    const applyBtn = screen.getByText(/Apply: Acme Cable 2/i);
    expect(applyBtn).toBeTruthy();
    
    // Switch to OK state on next validation
    (audioLine.validateAudioLines as any).mockReturnValue({ findings: [] });
    
    fireEvent.click(applyBtn);
    
    const store = useDocumentStore.getState();
    const updatedCable = store.document.cables.find((c: any) => c.id === 'edge-1');
    expect(updatedCable?.type).toBe('cab-2');
    
    // Rerender to show finding cleared
    rerender(<EdgeInspector />);
    expect(screen.queryByText(/Apply:/)).toBeNull();
  });
});
