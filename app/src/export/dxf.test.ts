import { describe, it, expect } from 'vitest';
import { exportToDxf, type DxfNode, type DxfEdge } from './dxf';

describe('exportToDxf', () => {
  it('should return a DXF string containing ENTITIES and TEXT', () => {
    const nodes: DxfNode[] = [
      { id: 'node1', position: { x: 0, y: 0 }, initialWidth: 100, initialHeight: 50,  },
      { id: 'node2', position: { x: 200, y: 0 }, initialWidth: 100, initialHeight: 50,  }
    ];
    const edges: DxfEdge[] = [
      { source: 'node1', target: 'node2' }
    ];

    const result = exportToDxf(nodes, edges);
    expect(typeof result).toBe('string');
    expect(result).toContain('ENTITIES');
    expect(result).toContain('TEXT');
  });
});


