import Drawing from 'dxf-writer';
import type { Node, Edge } from '@xyflow/react';

export function exportToDxf(nodes: Node[], edges: Edge[]): string {
  const d = new Drawing();
  
  const nodeMap = new Map<string, Node>();
  for (const node of nodes) {
    nodeMap.set(node.id, node);
  }

  for (const node of nodes) {
    const x = node.position.x;
    const y = node.position.y;
    const width = node.initialWidth ?? 0;
    const height = node.initialHeight ?? 0;
    
    d.drawRect(x, y, x + width, y + height);
    d.drawText(x + 5, y + 15, 10, 0, node.id);
  }

  for (const edge of edges) {
    const source = nodeMap.get(edge.source);
    const target = nodeMap.get(edge.target);
    if (source && target) {
      const sourceWidth = source.initialWidth ?? 0;
      const sourceHeight = source.initialHeight ?? 0;
      const targetWidth = target.initialWidth ?? 0;
      const targetHeight = target.initialHeight ?? 0;

      const x1 = source.position.x + sourceWidth / 2;
      const y1 = source.position.y + sourceHeight / 2;
      const x2 = target.position.x + targetWidth / 2;
      const y2 = target.position.y + targetHeight / 2;
      d.drawLine(x1, y1, x2, y2);
    }
  }

  return d.toDxfString();
}
