import { describe, it, expect } from 'vitest';
import { findPath, updateCostGrid } from './core';

describe('findPath (A*)', () => {
    it('should find a straight path on an empty grid', () => {
        const path = findPath(5, 5, 0, 0, 4, 0, []);
        expect(path).toHaveLength(5);
        expect(path[4]).toEqual({ x: 4, y: 0 });
    });

    it('should route around a simple obstacle', () => {
        const obstacles = [{ x: 1, y: 0 }, { x: 1, y: 1 }];
        const path = findPath(5, 5, 0, 0, 2, 0, obstacles);
        expect(path.length).toBeGreaterThan(3);
        expect(path[path.length - 1]).toEqual({ x: 2, y: 0 });
    });

    it('should return empty array if start is same as end', () => {
        const path = findPath(5, 5, 2, 2, 2, 2, []);
        expect(path).toHaveLength(1);
        expect(path[0]).toEqual({ x: 2, y: 2 });
    });

    it('should return empty array if no path exists', () => {
        const obstacles = [
            { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 },
            { x: 0, y: 2 }
        ];
        // 0,0 is boxed in
        const path = findPath(5, 5, 0, 0, 4, 4, obstacles);
        expect(path).toHaveLength(0);
    });

    it('should prefer a longer straight path over a shorter zigzag path due to turn penalty', () => {
        const obstacles = [
            { x: 2, y: 0 },
            { x: 2, y: 1 }
        ];
        const path = findPath(5, 5, 0, 0, 4, 0, obstacles);
        
        let turns = 0;
        let currentDir = 'NONE';
        for (let i = 1; i < path.length; i++) {
            const dx = path[i]!.x - path[i-1]!.x;
            const dy = path[i]!.y - path[i-1]!.y;
            let dir = 'NONE';
            if (dx === 1) dir = 'RIGHT';
            else if (dx === -1) dir = 'LEFT';
            else if (dy === 1) dir = 'DOWN';
            else if (dy === -1) dir = 'UP';
            
            if (currentDir !== 'NONE' && dir !== currentDir) {
                turns++;
            }
            currentDir = dir;
        }
        
        expect(turns).toBeLessThanOrEqual(2);
    });

    it('should prefer established bundle when multiple paths have equal base cost', () => {
        const costGrid = new Map<string, number>();
        // Create an L-shaped bundle from (0,0) down to (0,5), then right to (5,5)
        const bundlePath: {x: number, y: number}[] = [];
        for (let y = 0; y <= 5; y++) bundlePath.push({x: 0, y});
        for (let x = 1; x <= 5; x++) bundlePath.push({x, y: 5});
        updateCostGrid(costGrid, bundlePath);

        const path = findPath(6, 6, 0, 0, 5, 5, [], costGrid);
        
        const passesThroughBundle = path.some(p => p.x === 0 && p.y === 5);
        expect(passesThroughBundle).toBe(true);
    });
});
