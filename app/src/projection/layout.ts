import ELK from 'elkjs/lib/elk.bundled.js';
import type { ElkNode, ElkExtendedEdge } from 'elkjs';
import { CARD_WIDTH, CARD_HEADER_H } from '../model/geometry.js';

const elk = new ELK();

export interface ElkLayoutOptions {
  wireSpacing?: number;
  portPadding?: number;
}

export async function applyElkLayoutX6(
  nodes: any[],
  edges: any[],
  options: { wireSpacing?: number; portPadding?: number } = {}
): Promise<{ nodes: any[]; edges: any[] }> {
  if (nodes.length === 0) return { nodes, edges };

  const wSpacing = (options?.wireSpacing ?? 10).toString();
  const pPadding = (options?.portPadding ?? 30).toString(); // User requested 30px minimum straight out of terminal

  const elkNodes: ElkNode[] = nodes.map((node) => {
    return {
      id: node.id,
      width: node.width ?? CARD_WIDTH,
      height: node.height ?? CARD_HEADER_H,
      layoutOptions: {
        'elk.portConstraints': 'FIXED_POS'
      },
      ports: node.ports?.items?.map((p: any) => ({
        id: p.id,
        x: p.args?.x ?? (p.group === 'in' ? 0 : (node.width ?? CARD_WIDTH)),
        y: p.args?.y ?? 0,
        properties: { 
          'port.side': p.group === 'in' ? 'WEST' : 'EAST'
        }
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
      'elk.layered.spacing.edgeNodeBetweenLayers': pPadding, // This forces the edge to go straight for pPadding pixels
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
  const edgePositionMap = new Map<string, Array<{ x: number; y: number }>>();

  for (const child of layoutedGraph.children ?? []) {
    if (child?.x !== undefined && child?.y !== undefined) {
      positionMap.set(child.id, { x: child.x, y: child.y });
    }
  }

  for (const edge of layoutedGraph.edges ?? []) {
    if (edge?.sections && edge.sections.length > 0) {
      const bends = edge!.sections![0]!.bendPoints ?? [];
      
      const allPoints = [];
      if (edge!.sections![0]!.startPoint) allPoints.push(edge!.sections![0]!.startPoint);
      allPoints.push(...bends);
      if (edge!.sections![0]!.endPoint) allPoints.push(edge!.sections![0]!.endPoint);
      
      edgePositionMap.set(edge.id, allPoints.map((b: any) => ({ x: b.x, y: b.y })));
    }
  }

  const updatedNodes = nodes.map((node) => {
    const pos = positionMap.get(node.id);
    if (!pos) return node;
    return {
      ...node,
      x: pos.x,
      y: pos.y,
    };
  });

  const updatedEdges = edges.map((edge) => {
    const bends = edgePositionMap.get(edge.id);
    if (!bends || bends.length === 0) return edge;
    return {
      ...edge,
      vertices: bends
    };
  });

  return { nodes: updatedNodes, edges: updatedEdges };
}
