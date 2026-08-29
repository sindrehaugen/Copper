import { describe, it, expect } from 'vitest';
import { toFlow } from './toFlow';
import type { DesignDocument, Device, Cable } from '../model/schema';
import { CARD_WIDTH, CARD_HEADER_H, CARD_PAD_Y, PORT_ROW_H } from '../model/geometry';

describe('toFlow projection', () => {
  it('maps devices to nodes and cables to edges with seeded dimensions', () => {
    const device1: Device = {
      id: 'dev1',
      deviceTypeId: 'type1',
      siteId: 'site1',
      status: 'active',
      name: 'Device 1',
      interfaces: [
        { id: 'if1', name: 'eth0', type: '1000base-t' },
        { id: 'if2', name: 'eth1', type: '1000base-t' }
      ]
    };

    const device2: Device = {
      id: 'dev2',
      deviceTypeId: 'type1',
      siteId: 'site1',
      status: 'active',
      name: 'Device 2',
      frontPorts: [
        { id: 'fp1', name: 'port1', type: '1000base-t', rearPortId: 'rp1', rearPortPosition: 1 }
      ],
      rearPorts: [
        { id: 'rp1', name: 'rear1', type: '1000base-t', positions: 1 }
      ]
    };

    const cable1: Cable = {
      id: 'cable1',
      status: 'connected',
      terminations: [
        { deviceId: 'dev1', portRef: { kind: 'interface', name: 'eth0', id: 'if1' } },
        { deviceId: 'dev2', portRef: { kind: 'frontPort', name: 'port1', id: 'fp1' } }
      ]
    };

    const doc: DesignDocument = {
      schemaVersion: 1,
      designLabel: 'Test Design',
      sites: [],
      locations: [],
      racks: [],
      deviceTypes: [],
      devices: [device1, device2],
      cables: [cable1],
      signalClasses: []
    };

    const layout = {
      dev1: { x: 100, y: 200 },
      dev2: { x: 500, y: 300 }
    };

    const { nodes, edges } = toFlow(doc, layout);

    expect(nodes).toHaveLength(2);
    expect(edges).toHaveLength(1);

    const n1 = nodes.find(n => n.id === 'dev1');
    expect(n1).toBeDefined();
    expect(n1?.position).toEqual({ x: 100, y: 200 });
    expect(n1?.initialWidth).toBe(CARD_WIDTH);
    expect(n1?.initialHeight).toBe(CARD_HEADER_H + CARD_PAD_Y + 2 * PORT_ROW_H);
    expect(n1?.data.device).toBe(device1);

    const n2 = nodes.find(n => n.id === 'dev2');
    expect(n2).toBeDefined();
    expect(n2?.position).toEqual({ x: 500, y: 300 });
    expect(n2?.initialWidth).toBe(CARD_WIDTH);
    expect(n2?.initialHeight).toBe(CARD_HEADER_H + CARD_PAD_Y + 2 * PORT_ROW_H);
    expect(n2?.data.device).toBe(device2);

    const e1 = edges[0]!;
    expect(e1.id).toBe('cable1');
    expect(e1.source).toBe('dev1');
    expect(e1.sourceHandle).toBe('if1');
    expect(e1.target).toBe('dev2');
    expect(e1.targetHandle).toBe('fp1');
  });

  it('handles empty layout by defaulting to 0,0', () => {
    const doc: DesignDocument = {
      schemaVersion: 1,
      designLabel: 'Test Design',
      devices: [
        {
          id: 'dev1',
          deviceTypeId: 'type1',
          siteId: 'site1',
          status: 'active'
        }
      ],
      cables: []
    } as unknown as DesignDocument;

    const { nodes } = toFlow(doc);
    expect(nodes[0]!.position).toEqual({ x: 0, y: 0 });
  });
});
