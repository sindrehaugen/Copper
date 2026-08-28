import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ReactFlowProvider } from '@xyflow/react';
import { CanvasView, defaultNodeTypes } from './CanvasView';
import { DeviceNode, getDevicePorts } from './nodes/DeviceNode';
import { toFlow } from '../../projection/toFlow';
import type { DesignDocument, Device, Cable } from '../../model/schema';

describe('CanvasView & DeviceNode (Batch 022 P.Wave 4)', () => {
  const sampleDevice: Device = {
    id: 'device-sw1',
    deviceTypeId: 'dt-switch-24',
    siteId: 'site-hq',
    status: 'active',
    name: 'Core Switch 01',
    designation: '+R1K1-U1=SW001',
    interfaces: [
      { id: 'p-sw1-eth0', name: 'eth0', label: 'Uplink 1', type: '1000base-t' },
      { id: 'p-sw1-eth1', name: 'eth1', type: '1000base-t' },
    ],
    frontPorts: [
      { id: 'p-sw1-fp1', name: 'fp1', label: 'Patch 1', type: '1000base-t', rearPortId: 'p-sw1-rp1', rearPortPosition: 1 },
    ],
    rearPorts: [
      { id: 'p-sw1-rp1', name: 'rp1', type: '1000base-t', positions: 1 },
    ],
    consolePorts: [
      { id: 'p-sw1-con0', name: 'con0', label: 'Serial', type: 'rj45' },
    ],
    powerPorts: [
      { id: 'p-sw1-pwr1', name: 'pwr1', label: 'AC Main', type: 'iec-60320-c14' },
    ],
    powerOutlets: [
      { id: 'p-sw1-out1', name: 'out1', label: 'Aux Out', type: 'iec-60320-c13' },
    ],
  };

  const sampleTargetDevice: Device = {
    id: 'device-dsp1',
    deviceTypeId: 'dt-dsp',
    siteId: 'site-hq',
    status: 'active',
    name: 'Audio DSP 01',
    interfaces: [
      { id: 'p-dsp1-lan1', name: 'lan1', label: 'Control', type: '1000base-t' },
    ],
  };

  const sampleCable: Cable = {
    id: 'cable-link-1',
    status: 'connected',
    terminations: [
      { deviceId: 'device-sw1', portRef: { kind: 'interface', name: 'eth0', id: 'p-sw1-eth0' } },
      { deviceId: 'device-dsp1', portRef: { kind: 'interface', name: 'lan1', id: 'p-dsp1-lan1' } },
    ],
  };

  const sampleDoc: DesignDocument = {
    schemaVersion: 1,
    designLabel: 'Canvas Integration Test Design',
    sites: [],
    locations: [],
    racks: [],
    deviceTypes: [],
    devices: [sampleDevice, sampleTargetDevice],
    cables: [sampleCable],
    signalClasses: [],
  };

  describe('getDevicePorts helper', () => {
    it('extracts all 7 ports across all component kinds in canonical order', () => {
      const ports = getDevicePorts(sampleDevice);
      expect(ports).toHaveLength(7);
      expect(ports.map((p) => p.kind)).toEqual([
        'interface',
        'interface',
        'frontPort',
        'rearPort',
        'consolePort',
        'powerPort',
        'powerOutlet',
      ]);
      expect(ports.map((p) => p.id)).toEqual([
        'p-sw1-eth0',
        'p-sw1-eth1',
        'p-sw1-fp1',
        'p-sw1-rp1',
        'p-sw1-con0',
        'p-sw1-pwr1',
        'p-sw1-out1',
      ]);
    });
  });

  describe('DeviceNode rendering', () => {
    it('renders device header and all port rows with dual source and target handles', () => {
      const nodeProps = {
        id: 'node-sw1',
        type: 'device' as const,
        data: { device: sampleDevice },
        selected: false,
        zIndex: 0,
        isConnectable: false,
        positionAbsoluteX: 0,
        positionAbsoluteY: 0,
        dragging: false,
        deletable: false,
        selectable: true,
        draggable: false,
      };

      const html = renderToStaticMarkup(
        <ReactFlowProvider>
          <DeviceNode {...(nodeProps as unknown as Parameters<typeof DeviceNode>[0])} />
        </ReactFlowProvider>
      );

      // Verify device header
      expect(html).toContain('Core Switch 01');

      // Verify port names & labels
      expect(html).toContain('Uplink 1');
      expect(html).toContain('eth1');
      expect(html).toContain('Patch 1');
      expect(html).toContain('rp1');
      expect(html).toContain('Serial');
      expect(html).toContain('AC Main');
      expect(html).toContain('Aux Out');

      // Verify dual handles (both left/target and right/source handles present for each port)
      const ports = getDevicePorts(sampleDevice);
      for (const port of ports) {
        expect(html).toContain(`data-handleid="${port.id}"`);
        expect(html).toContain('react-flow__handle-left');
        expect(html).toContain('react-flow__handle-right');
      }

      // Check target handle attributes
      expect(html).toContain('data-handlepos="left"');
      // Check source handle attributes
      expect(html).toContain('data-handlepos="right"');
    });
  });

  describe('CanvasView rendering', () => {
    it('renders without crashing when provided mock nodes and edges from toFlow projection', () => {
      const { nodes, edges } = toFlow(sampleDoc, {
        'device-sw1': { x: 50, y: 50 },
        'device-dsp1': { x: 400, y: 50 },
      });

      const deviceNodes = nodes.map((n) => ({ ...n, type: 'device' }));

      const html = renderToStaticMarkup(
        <CanvasView nodes={deviceNodes} edges={edges} />
      );

      expect(html).toContain('copper-canvas-container');
      expect(html).toContain('react-flow');
      expect(html).toContain('Core Switch 01');
      expect(html).toContain('Audio DSP 01');
      expect(html).toContain('p-sw1-eth0');
      expect(html).toContain('p-dsp1-lan1');
    });

    it('renders empty canvas when no nodes/edges are passed', () => {
      const html = renderToStaticMarkup(<CanvasView />);
      expect(html).toContain('copper-canvas-container');
      expect(html).toContain('react-flow');
    });

    it('§6.4 mutation guard: nodeTypes mapping includes device', () => {
      expect(defaultNodeTypes.device).toBe(DeviceNode);
    });
  });
});
