import ELK from 'elkjs/lib/elk.bundled.js';
import type { ElkNode, ElkExtendedEdge } from 'elkjs';
import { CARD_WIDTH, CARD_HEADER_H } from '../model/geometry';

const elk = new ELK();

export interface ElkLayoutOptions {
  wireSpacing?: number;
}

export async function applyElkLayoutX6(
  nodes: any[],
  edges: any[],
  options?: ElkLayoutOptions
): Promise<any[]> {
  if (nodes.length === 0) return [];

  const wSpacing = (options?.wireSpacing ?? 10).toString();

  const elkNodes: ElkNode[] = nodes.map((node) => {
    return {
      id: node.id,
      width: node.width ?? CARD_WIDTH,
      height: node.height ?? CARD_HEADER_H,
      ports: node.ports?.items?.map((p: any) => ({
        id: p.id,
        properties: { 'port.side': p.group === 'in' ? 'WEST' : 'EAST' }
      })) || []
    };
  });

  const elkEdges: ElkExtendedEdge[] = edges.map((edge) => ({
    id: edge.id,
    sources: [edge.source.port || edge.source.cell],
    targets: [edge.target.port || edge.target.cell],
  }));

  const graph: ElkNode = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'RIGHT',
      'elk.layered.spacing.nodeNodeBetweenLayers': '150',
      'elk.layered.spacing.edgeNodeBetweenLayers': wSpacing,
      'elk.spacing.edgeEdge': wSpacing,
      'elk.spacing.nodeNode': '80',
      'elk.edgeRouting': 'ORTHOGONAL',
      'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX'
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
    if (!pos) return node;
    return {
      ...node,
      x: pos.x,
      y: pos.y,
    };
  });
}
