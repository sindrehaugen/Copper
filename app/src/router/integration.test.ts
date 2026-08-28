import { describe, it, expect } from 'vitest';
import type { Node } from '@xyflow/react';
import { routeEdge, getObstaclesFromNodes } from './integration';

describe('router integration', () => {
    const gridParams = {
        gridSize: 10,
        gridWidth: 100,
        gridHeight: 100
    };

    const sourceNode: Node = {
        id: 'nodeA',
        position: { x: 50, y: 50 },
        width: 100,
        height: 100,
        data: {}
    };

    const targetNode: Node = {
        id: 'nodeB',
        position: { x: 250, y: 50 },
        width: 100,
        height: 100,
        data: {}
    };

    const obstacleNode: Node = {
        id: 'nodeC',
        position: { x: 170, y: 50 },
        width: 50,
        height: 100,
        data: {}
    };

    it('extracts obstacles from nodes', () => {
        const nodes = [sourceNode, obstacleNode];
        const obstacles = getObstaclesFromNodes(nodes, gridParams, [sourceNode.id]);
        
        expect(obstacles.length).toBeGreaterThan(0);
        const obstacleXs = new Set(obstacles.map(o => o.x));
        expect(obstacleXs.has(5)).toBe(false);
        expect(obstacleXs.has(17)).toBe(true);
    });

    it('routes an edge successfully', () => {
        const sourceHandle = { x: 150, y: 100, direction: 'RIGHT' as const };
        const targetHandle = { x: 250, y: 100, direction: 'LEFT' as const };
        
        const path = routeEdge(
            sourceNode, 
            targetNode, 
            sourceHandle, 
            targetHandle, 
            [sourceNode, targetNode, obstacleNode], 
            gridParams
        );
        
        expect(path).toContain('M ');
        expect(path).toContain(' L ');
    });

    it('returns empty string if no path is found', () => {
        const blocker: Node = {
            id: 'blocker',
            position: { x: 240, y: 40 },
            width: 120,
            height: 120,
            data: {}
        };
        const sourceHandle = { x: 150, y: 100, direction: 'RIGHT' as const };
        const targetHandle = { x: 250, y: 100, direction: 'LEFT' as const };
        
        const path = routeEdge(
            sourceNode, 
            targetNode, 
            sourceHandle, 
            targetHandle, 
            [sourceNode, targetNode, blocker], 
            gridParams
        );
        
        expect(path).toBe('');
    });
});

