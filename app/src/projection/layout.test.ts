import { describe, it, expect } from 'vitest';
import type { Node, Edge } from '@xyflow/react';
import { applyElkLayout } from './layout';
import { CARD_WIDTH, CARD_HEADER_H } from '../model/geometry';

describe('applyElkLayout', () => {
  it('returns an empty array when given no nodes', async () => {
    const result = await applyElkLayout([], []);
    expect(result).toEqual([]);
  });

  it('positions connected nodes differently from (0,0) with rightward flow', async () => {
    const nodes: Node[] = [
      {
        id: 'node-1',
        position: { x: 0, y: 0 },
        data: { label: 'Source' },
        initialWidth: CARD_WIDTH,
        initialHeight: CARD_HEADER_H,
      },
      {
        id: 'node-2',
        position: { x: 0, y: 0 },
        data: { label: 'Target' },
        initialWidth: CARD_WIDTH,
        initialHeight: CARD_HEADER_H,
      },
    ];

    const edges: Edge[] = [
      {
        id: 'edge-1-2',
        source: 'node-1',
        target: 'node-2',
      },
    ];

    const layoutedNodes = await applyElkLayout(nodes, edges);

    expect(layoutedNodes).toHaveLength(2);

    const n1 = layoutedNodes.find((n) => n.id === 'node-1');
    const n2 = layoutedNodes.find((n) => n.id === 'node-2');

    expect(n1).toBeDefined();
    expect(n2).toBeDefined();

    // Verify positions changed from 0,0
    expect(n1!.position.x !== 0 || n1!.position.y !== 0).toBe(true);
    expect(n2!.position.x !== 0 || n2!.position.y !== 0).toBe(true);

    // Direction is RIGHT: target node must be positioned to the right of source node
    expect(n2!.position.x).toBeGreaterThan(n1!.position.x + CARD_WIDTH);

    // Verify preservation of node data and dimensions
    expect(n1!.data).toEqual({ label: 'Source' });
    expect(n2!.data).toEqual({ label: 'Target' });
    expect(n1!.initialWidth).toBe(CARD_WIDTH);
    expect(n1!.initialHeight).toBe(CARD_HEADER_H);
  });

  it('lays out multi-node branch structures with distinct coordinates', async () => {
    const nodes: Node[] = [
      {
        id: 'src',
        position: { x: 0, y: 0 },
        data: {},
        initialWidth: 200,
        initialHeight: 100,
      },
      {
        id: 'dst1',
        position: { x: 0, y: 0 },
        data: {},
        initialWidth: 200,
        initialHeight: 100,
      },
      {
        id: 'dst2',
        position: { x: 0, y: 0 },
        data: {},
        initialWidth: 200,
        initialHeight: 100,
      },
    ];

    const edges: Edge[] = [
      { id: 'e1', source: 'src', target: 'dst1' },
      { id: 'e2', source: 'src', target: 'dst2' },
    ];

    const layouted = await applyElkLayout(nodes, edges);
    const src = layouted.find((n) => n.id === 'src')!;
    const dst1 = layouted.find((n) => n.id === 'dst1')!;
    const dst2 = layouted.find((n) => n.id === 'dst2')!;

    // Both destination nodes should be to the right of source
    expect(dst1.position.x).toBeGreaterThan(src.position.x);
    expect(dst2.position.x).toBeGreaterThan(src.position.x);

    // Destination nodes in the same layer should have different vertical positions
    expect(dst1.position.y).not.toBe(dst2.position.y);
  });
});
