import type { Node, Edge } from '@xyflow/react';
import { routeEdge, GridParams, HandlePosition } from './integration';
import { evaluateQuality, Rect, Point } from './quality';

export interface RouteStrategy {
    gridSize: number;
    uTurnBudget: number;
    expansionBudget: number;
}

export interface RouteRequest {
    nodes: Node[];
    edges: Edge[];
    bounds: Rect[];
    strategyParams?: unknown;
}

export interface RouteResponse {
    bestScore: number;
    bestStrategy: RouteStrategy;
    bestPaths: string[];
}

export function parseSvgPath(path: string): Point[] {
    if (!path) return [];
    const points: Point[] = [];
    const parts = path.split(' ');
    for (let i = 0; i < parts.length; i++) {
        if (parts[i] === 'M' || parts[i] === 'L') {
            const x = parseFloat(parts[i + 1] as string);
            const y = parseFloat(parts[i + 2] as string);
            if (!isNaN(x) && !isNaN(y)) {
                points.push({ x, y });
            }
            i += 2;
        }
    }
    return points;
}

type XYFlowHandle = { id: string; x: number; y: number; width: number; height: number };
type MeasuredWithBounds = { handleBounds?: { source?: XYFlowHandle[]; target?: XYFlowHandle[] } };

function getHandlePos(node: Node, handleId: string | null | undefined, type: 'source' | 'target'): HandlePosition {
    const defaultPos: HandlePosition = { x: node.position.x, y: node.position.y, direction: type === 'source' ? 'RIGHT' : 'LEFT' };
    const handleBounds = (node.measured as unknown as MeasuredWithBounds)?.handleBounds?.[type];
    if (!handleBounds) return defaultPos;
    
    // Find matching handle or use first available
    const handle = handleId ? handleBounds.find(h => h.id === handleId) : handleBounds[0];
    if (!handle) return defaultPos;

    // XYFlow handle x/y are relative to the node
    return {
        x: node.position.x + handle.x + (handle.width / 2),
        y: node.position.y + handle.y + (handle.height / 2),
        direction: type === 'source' ? 'RIGHT' : 'LEFT' // Extend to dynamic direction if provided by handle data
    };
}

self.addEventListener('message', (e: MessageEvent<RouteRequest>) => {
    const { nodes, edges, bounds } = e.data;

    const variations: RouteStrategy[] = [
        { gridSize: 10, uTurnBudget: 1, expansionBudget: 0 },
        { gridSize: 20, uTurnBudget: 2, expansionBudget: 1 },
        { gridSize: 15, uTurnBudget: 1, expansionBudget: 1 }
    ];

    let bestScore = Infinity;
    let bestResult: RouteResponse | null = null;

    for (const v of variations) {
        const gridParams: GridParams = {
            gridSize: v.gridSize,
            gridWidth: 1000,
            gridHeight: 1000
        };

        const pathsForEvaluation: Point[][] = [];
        const svgPaths: string[] = [];

        for (const edge of edges) {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);
            if (!sourceNode || !targetNode) continue;

            const sourceHandle = getHandlePos(sourceNode, edge.sourceHandle, 'source');
            const targetHandle = getHandlePos(targetNode, edge.targetHandle, 'target');

            const pathStr = routeEdge(sourceNode, targetNode, sourceHandle, targetHandle, nodes, gridParams, v);
            svgPaths.push(pathStr);
            pathsForEvaluation.push(parseSvgPath(pathStr));
        }

        const score = evaluateQuality(pathsForEvaluation, bounds);
        
        if (score < bestScore) {
            bestScore = score;
            bestResult = {
                bestScore: score,
                bestStrategy: v,
                bestPaths: svgPaths
            };
        }
    }

    self.postMessage(bestResult);
});
