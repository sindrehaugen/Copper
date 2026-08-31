import ELK from 'elkjs/lib/elk.bundled.js';
import type { ElkNode, ElkExtendedEdge } from 'elkjs';
import type { Node, Edge } from '@xyflow/react';
import { CARD_WIDTH, CARD_HEADER_H } from '../model/geometry';

const elk = new ELK();

export interface ElkLayoutOptions {
  wireSpacing?: number;
}

export async function applyElkLayout(
  nodes: Node[],
  edges: Edge[],
  options?: ElkLayoutOptions
): Promise<Node[]> {
  if (nodes.length === 0) return [];

  const wSpacing = (options?.wireSpacing ?? 10).toString();

  const elkNodes: ElkNode[] = nodes.map((node) => ({
    id: node.id,
    width: node.initialWidth ?? node.width ?? CARD_WIDTH,
    height: node.initialHeight ?? node.height ?? CARD_HEADER_H,
    ports: [
      ...(node.data.inputPorts as any[] || []).map(p => ({
        id: p.id,
        properties: { 'port.side': 'WEST' }
      })),
      ...(node.data.outputPorts as any[] || []).map(p => ({
        id: p.id,
        properties: { 'port.side': 'EAST' }
      }))
    ]
  }));

  const elkEdges: ElkExtendedEdge[] = edges.map((edge) => ({
    id: edge.id,
    sources: [edge.sourceHandle || edge.source],
    targets: [edge.targetHandle || edge.target],
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
      position: { x: pos.x, y: pos.y },
    };
  });
}
