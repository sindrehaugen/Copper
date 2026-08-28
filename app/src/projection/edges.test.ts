import { describe, it, expect } from 'vitest';
import type { Edge } from '@xyflow/react';
import type { DesignDocument, Device, Cable } from '../model/schema';
import { toFlow } from './toFlow';
import {
  createNaiveEdge,
  createNaiveEdges,
  enhanceEdges,
  DEFAULT_EDGE_TYPE,
  DEFAULT_EDGE_STYLE,
} from './edges';

describe('edges projection (naive-edges)', () => {
  const sampleDoc: DesignDocument = {
    schemaVersion: 1,
    designLabel: 'Test Edge Design',
    sites: [],
    locations: [],
    racks: [],
    deviceTypes: [],
    devices: [
      {
        id: 'dev1',
        name: 'Device A',
        deviceTypeId: 'dt1',
        siteId: 's1',
        status: 'active',
        interfaces: [{ id: 'if1', name: 'eth0', type: '1000base-t' }],
      } as Device,
      {
        id: 'dev2',
        name: 'Device B',
        deviceTypeId: 'dt1',
        siteId: 's1',
        status: 'active',
        interfaces: [{ id: 'if2', name: 'eth1', type: '1000base-t' }],
      } as Device,
    ],
    cables: [
      {
        id: 'cable-1',
        status: 'connected',
        terminations: [
          { deviceId: 'dev1', portRef: { kind: 'interface', name: 'eth0', id: 'if1' } },
          { deviceId: 'dev2', portRef: { kind: 'interface', name: 'eth1', id: 'if2' } },
        ],
      } as Cable,
    ],
    signalClasses: [],
  };

  it('maps raw edges from toFlow to smoothstep edges with M3 token styling', () => {
    const { edges: rawEdges } = toFlow(sampleDoc);
    expect(rawEdges).toHaveLength(1);

    const edges = createNaiveEdges(rawEdges);
    expect(edges).toHaveLength(1);

    const edge = edges[0]!;
    expect(edge.id).toBe('cable-1');
    expect(edge.source).toBe('dev1');
    expect(edge.sourceHandle).toBe('if1');
    expect(edge.target).toBe('dev2');
    expect(edge.targetHandle).toBe('if2');
    expect(edge.type).toBe('smoothstep');
    expect(edge.type).toBe(DEFAULT_EDGE_TYPE);
    expect(edge.style).toEqual(DEFAULT_EDGE_STYLE);
    expect(edge.style?.stroke).toBe('var(--md-sys-color-outline, #79747e)');
    expect(edge.style?.strokeWidth).toBe(2);
  });

  it('supports custom edge options such as bezier type, animation, and custom styles', () => {
    const rawEdge: Edge = {
      id: 'e1',
      source: 'n1',
      target: 'n2',
      sourceHandle: 'p1',
      targetHandle: 'p2',
    };

    const enhanced = createNaiveEdge(rawEdge, {
      type: 'bezier',
      animated: true,
      style: { stroke: '#ff5500', strokeDasharray: '4 2' },
      className: 'custom-edge-class',
      interactionWidth: 20,
      selectable: false,
      deletable: false,
      data: { customAttr: 'test-value' },
    });

    expect(enhanced.id).toBe('e1');
    expect(enhanced.source).toBe('n1');
    expect(enhanced.target).toBe('n2');
    expect(enhanced.sourceHandle).toBe('p1');
    expect(enhanced.targetHandle).toBe('p2');
    expect(enhanced.type).toBe('bezier');
    expect(enhanced.animated).toBe(true);
    expect(enhanced.style?.stroke).toBe('#ff5500');
    expect(enhanced.style?.strokeDasharray).toBe('4 2');
    expect(enhanced.style?.strokeWidth).toBe(2);
    expect(enhanced.className).toBe('custom-edge-class');
    expect(enhanced.interactionWidth).toBe(20);
    expect(enhanced.selectable).toBe(false);
    expect(enhanced.deletable).toBe(false);
    expect(enhanced.data).toEqual({ customAttr: 'test-value' });
  });

  it('does not mutate incoming raw edge objects or arrays (pure immutability)', () => {
    const rawEdge: Edge = Object.freeze({
      id: 'e-immutable',
      source: 'n1',
      target: 'n2',
      sourceHandle: 'h1',
      targetHandle: 'h2',
      style: Object.freeze({ stroke: 'black' }),
    });
    const rawEdges: Edge[] = Object.freeze([rawEdge]) as unknown as Edge[];

    const result = createNaiveEdges(rawEdges, {
      type: 'step',
      animated: true,
      style: { strokeWidth: 4 },
    });

    expect(result).not.toBe(rawEdges);
    expect(result[0]).not.toBe(rawEdge);
    expect(result[0]!.type).toBe('step');
    expect(result[0]!.animated).toBe(true);
    expect(result[0]!.style?.stroke).toBe('black');
    expect(result[0]!.style?.strokeWidth).toBe(4);

    // Verify raw input remained unchanged
    expect(rawEdge.type).toBeUndefined();
    expect(rawEdge.animated).toBeUndefined();
    expect(rawEdge.style?.stroke).toBe('black');
  });

  it('handles empty edge lists cleanly', () => {
    const result = createNaiveEdges([]);
    expect(result).toEqual([]);
  });

  it('provides enhanceEdges alias matching createNaiveEdges behavior', () => {
    const rawEdge: Edge = { id: 'e2', source: 'a', target: 'b' };
    const res1 = createNaiveEdges([rawEdge]);
    const res2 = enhanceEdges([rawEdge]);

    expect(res1).toEqual(res2);
    expect(enhanceEdges).toBe(createNaiveEdges);
  });

  it('preserves existing edge properties when no overriding options provided', () => {
    const rawEdge: Edge = {
      id: 'e3',
      source: 'a',
      target: 'b',
      type: 'straight',
      animated: true,
      data: { original: true },
    };

    const enhanced = createNaiveEdge(rawEdge);
    expect(enhanced.type).toBe('straight');
    expect(enhanced.animated).toBe(true);
    expect(enhanced.data).toEqual({ original: true });
    expect(enhanced.style).toEqual(DEFAULT_EDGE_STYLE);
  });
});
