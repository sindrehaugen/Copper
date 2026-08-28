import type { Node } from '@xyflow/react';
import { findPath, Point } from './core';

export interface GridParams {
    gridSize: number;
    gridWidth: number;
    gridHeight: number;
}

export interface HandlePosition {
    x: number;
    y: number;
    direction?: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
}

function getGridPoint(val: number, gridSize: number): number {
    return Math.floor(val / gridSize);
}

export function getObstaclesFromNodes(
    nodes: Node[], 
    gridParams: GridParams, 
    skipNodeIds: string[] = [],
    expansionBudget: number = 0
): Point[] {
    const obstacles: Point[] = [];
    const skipSet = new Set(skipNodeIds);

    for (const node of nodes) {
        if (skipSet.has(node.id)) continue;
        
        const width = node.measured?.width ?? node.width ?? 100;
        const height = node.measured?.height ?? node.height ?? 100;
        
        const startX = getGridPoint(node.position.x - expansionBudget, gridParams.gridSize);
        const startY = getGridPoint(node.position.y - expansionBudget, gridParams.gridSize);
        const endX = getGridPoint(node.position.x + width + expansionBudget, gridParams.gridSize);
        const endY = getGridPoint(node.position.y + height + expansionBudget, gridParams.gridSize);

        for (let x = startX; x <= endX; x++) {
            for (let y = startY; y <= endY; y++) {
                if (x >= 0 && x < gridParams.gridWidth && y >= 0 && y < gridParams.gridHeight) {
                    obstacles.push({ x, y });
                }
            }
        }
    }

    return obstacles;
}

function pointsToSvgPath(points: Point[], gridSize: number): string {
    if (points.length === 0) return '';
    const center = gridSize / 2;
    let path = `M ${points[0]!.x * gridSize + center} ${points[0]!.y * gridSize + center}`;
    for (let i = 1; i < points.length; i++) {
        path += ` L ${points[i]!.x * gridSize + center} ${points[i]!.y * gridSize + center}`;
    }
    return path;
}


function applyUTurn(pos: HandlePosition, budget: number, gridParams: GridParams): Point {
    const gx = getGridPoint(pos.x, gridParams.gridSize);
    const gy = getGridPoint(pos.y, gridParams.gridSize);
    let nx = gx;
    let ny = gy;
    if (pos.direction === 'UP') ny = Math.max(0, gy - budget);
    else if (pos.direction === 'DOWN') ny = Math.min(gridParams.gridHeight - 1, gy + budget);
    else if (pos.direction === 'LEFT') nx = Math.max(0, gx - budget);
    else if (pos.direction === 'RIGHT') nx = Math.min(gridParams.gridWidth - 1, gx + budget);
    return { x: nx, y: ny };
}

export function routeEdge(
    sourceNode: Node,
    targetNode: Node,
    sourceHandle: HandlePosition,
    targetHandle: HandlePosition,
    allNodes: Node[],
    gridParams: GridParams,
    options?: {
        uTurnBudget?: number;
        expansionBudget?: number;
    }
): string {
    const uTurnBudget = options?.uTurnBudget ?? 1;
    const expansionBudget = options?.expansionBudget ?? 0;

    const obstacles = getObstaclesFromNodes(allNodes, gridParams, [sourceNode.id, targetNode.id], expansionBudget);
    
    const startPoint = applyUTurn(sourceHandle, uTurnBudget, gridParams);
    const endPoint = applyUTurn(targetHandle, uTurnBudget, gridParams);

    const pathPoints = findPath(
        gridParams.gridWidth,
        gridParams.gridHeight,
        startPoint.x,
        startPoint.y,
        endPoint.x,
        endPoint.y,
        obstacles
    );

    if (pathPoints.length === 0) {
        return '';
    }

    const fullPath: Point[] = [];
    const sourceGridPoint = { x: getGridPoint(sourceHandle.x, gridParams.gridSize), y: getGridPoint(sourceHandle.y, gridParams.gridSize) };
    if (uTurnBudget > 0 && (sourceGridPoint.x !== startPoint.x || sourceGridPoint.y !== startPoint.y)) {
        fullPath.push(sourceGridPoint);
    }
    fullPath.push(...pathPoints);
    const targetGridPoint = { x: getGridPoint(targetHandle.x, gridParams.gridSize), y: getGridPoint(targetHandle.y, gridParams.gridSize) };
    if (uTurnBudget > 0 && (targetGridPoint.x !== endPoint.x || targetGridPoint.y !== endPoint.y)) {
        fullPath.push(targetGridPoint);
    }

    return pointsToSvgPath(fullPath, gridParams.gridSize);
}

