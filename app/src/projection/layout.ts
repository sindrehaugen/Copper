import ELK, { type ElkNode, type ElkExtendedEdge } from 'elkjs';
import type { Node, Edge } from '@xyflow/react';
import { CARD_WIDTH, CARD_HEADER_H } from '../model/geometry';

const elk = new ELK();

/**
 * Applies layered ELK auto-layout to React Flow nodes and edges.
 * Positions are directed left-to-right based on graph connectivity.
 */
export async function applyElkLayout(
  nodes: Node[],
  edges: Edge[]
): Promise<Node[]> {
  if (nodes.length === 0) {
    return [];
  }

  const elkNodes: ElkNode[] = nodes.map((node) => ({
    id: node.id,
    width: node.initialWidth ?? node.width ?? CARD_WIDTH,
    height: node.initialHeight ?? node.height ?? CARD_HEADER_H,
  }));

  const elkEdges: ElkExtendedEdge[] = edges.map((edge) => ({
    id: edge.id,
    sources: [edge.source],
    targets: [edge.target],
  }));

  const graph: ElkNode = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'RIGHT',
    },
    children: elkNodes,
    edges: elkEdges,
  };

  const layoutedGraph = await elk.layout(graph);
  const positionMap = new Map<string, { x: number; y: number }>();

  for (const child of layoutedGraph.children ?? []) {
    if (child.x !== undefined && child.y !== undefined) {
      positionMap.set(child.id, { x: child.x, y: child.y });
    }
  }

  return nodes.map((node) => {
    const pos = positionMap.get(node.id);
    if (!pos) {
      return node;
    }
    return {
      ...node,
      position: { x: pos.x, y: pos.y },
    };
  });
}
