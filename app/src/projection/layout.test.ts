import { describe, it, expect } from 'vitest';
import { applyElkLayoutX6 } from './layout';
import { CARD_WIDTH, CARD_HEADER_H } from '../model/geometry';

type Node = { id: string, x: number, y: number, data?: any, width?: number, height?: number };
type Edge = { id: string, source: { cell: string }, target: { cell: string } };

describe('applyElkLayout', () => {
  it('returns an empty result when given no nodes', async () => {
    const result = await applyElkLayoutX6([], []);
    expect(result).toEqual({ nodes: [], edges: [] });
  });

  it('positions connected nodes differently from (0,0) with rightward flow', async () => {
    const nodes: Node[] = [
      {
        id: 'node-1',
        x: 0, y: 0,
        data: { label: 'Source' },
        width: CARD_WIDTH,
        height: CARD_HEADER_H,
      },
      {
        id: 'node-2',
        x: 0, y: 0,
        data: { label: 'Target' },
        width: CARD_WIDTH,
        height: CARD_HEADER_H,
      },
    ];

    const edges: Edge[] = [
      {
        id: 'edge-1-2',
        source: { cell: 'node-1' },
        target: { cell: 'node-2' },
      },
    ];

    const layoutedNodes = (await applyElkLayoutX6(nodes, edges)).nodes;

    expect(layoutedNodes).toHaveLength(2);

    const n1 = layoutedNodes.find((n) => n.id === 'node-1');
    const n2 = layoutedNodes.find((n) => n.id === 'node-2');

    expect(n1).toBeDefined();
    expect(n2).toBeDefined();

    // Verify positions changed from 0,0
    expect(n1!.x !== 0 || n1!.y !== 0).toBe(true);
    expect(n2!.x !== 0 || n2!.y !== 0).toBe(true);

    // Direction is RIGHT: target node must be positioned to the right of source node
    expect(n2!.x).toBeGreaterThan(n1!.x + CARD_WIDTH);

    // Verify preservation of node data and dimensions
    expect(n1!.data).toEqual({ label: 'Source' });
    expect(n2!.data).toEqual({ label: 'Target' });
    expect(n1!.width).toBe(CARD_WIDTH);
    expect(n1!.height).toBe(CARD_HEADER_H);
  });

  it('lays out multi-node branch structures with distinct coordinates', async () => {
    const nodes: Node[] = [
      {
        id: 'src',
        x: 0, y: 0,
        data: {},
        width: 200,
        height: 100,
      },
      {
        id: 'dst1',
        x: 0, y: 0,
        data: {},
        width: 200,
        height: 100,
      },
      {
        id: 'dst2',
        x: 0, y: 0,
        data: {},
        width: 200,
        height: 100,
      },
    ];

    const edges: Edge[] = [
      { id: 'e1', source: { cell: 'src' }, target: { cell: 'dst1' } },
      { id: 'e2', source: { cell: 'src' }, target: { cell: 'dst2' } },
    ];

    const layouted = (await applyElkLayoutX6(nodes, edges)).nodes;
    const src = layouted.find((n) => n.id === 'src')!;
    const dst1 = layouted.find((n) => n.id === 'dst1')!;
    const dst2 = layouted.find((n) => n.id === 'dst2')!;

    // Both destination nodes should be to the right of source
    expect(dst1.x).toBeGreaterThan(src.x);
    expect(dst2.x).toBeGreaterThan(src.x);

    // Destination nodes in the same layer should have different vertical positions
    expect(dst1.y).not.toBe(dst2.y);
  });
});


