import { describe, it, expect } from 'vitest';
import { exportToDxf } from './dxf';
import type { Node, Edge } from '@xyflow/react';

describe('exportToDxf', () => {
  it('should return a DXF string containing ENTITIES and TEXT', () => {
    const nodes: Node[] = [
      { id: 'node1', position: { x: 0, y: 0 }, initialWidth: 100, initialHeight: 50, data: {} },
      { id: 'node2', position: { x: 200, y: 0 }, initialWidth: 100, initialHeight: 50, data: {} }
    ];
    const edges: Edge[] = [
      { id: 'edge1', source: 'node1', target: 'node2' }
    ];

    const result = exportToDxf(nodes, edges);
    expect(typeof result).toBe('string');
    expect(result).toContain('ENTITIES');
    expect(result).toContain('TEXT');
  });
});
