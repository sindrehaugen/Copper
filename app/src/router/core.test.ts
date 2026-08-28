import { describe, it, expect } from 'vitest';
import { findPath } from './core';

describe('Router Core - A* Search', () => {
    it('should find a straight path', () => {
        const path = findPath(5, 5, 0, 0, 4, 0, []);
        expect(path).toEqual([
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 3, y: 0 },
            { x: 4, y: 0 }
        ]);
    });

    it('should avoid obstacles', () => {
        const path = findPath(3, 3, 0, 0, 2, 0, [{ x: 1, y: 0 }]);
        expect(path).toEqual([
            { x: 0, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
            { x: 2, y: 1 },
            { x: 2, y: 0 }
        ]);
    });

    it('should minimize turns (zigzag vs straight+turn)', () => {
        const path = findPath(3, 3, 0, 0, 2, 2, []);
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
        expect(turns).toBe(1);
    });

    it('should return empty array if no path found', () => {
        const path = findPath(3, 3, 0, 0, 2, 0, [
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 1, y: 2 }
        ]);
        expect(path).toEqual([]);
    });

    it('should handle start === end', () => {
        const path = findPath(5, 5, 2, 2, 2, 2, []);
        expect(path).toEqual([{ x: 2, y: 2 }]);
    });
});
