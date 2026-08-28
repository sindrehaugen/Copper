import { describe, it, expect } from 'vitest';
import { extractBundles } from './bundler';
import { Point } from './core';

describe('extractBundles', () => {
    it('should find a bundle of 3 cables sharing 3 edges', () => {
        const p1: Point[] = [
            {x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}
        ];
        const p2: Point[] = [
            {x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}
        ];
        const p3: Point[] = [
            {x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}
        ];
        
        const bundles = extractBundles([p1, p2, p3]);
        expect(bundles).toHaveLength(1);
        expect(bundles[0]!.cables).toBe(3);
        expect(bundles[0]!.path).toHaveLength(4); // 3 edges = 4 points
    });

    it('should not find a bundle if length is less than 3 grid units', () => {
        const p1: Point[] = [
            {x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}
        ];
        const p2: Point[] = [
            {x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}
        ];
        
        const bundles = extractBundles([p1, p2]);
        expect(bundles).toHaveLength(0);
    });

    it('should handle branching paths correctly', () => {
        const p1: Point[] = [
            {x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}
        ];
        const p2: Point[] = [
            {x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 3, y: 1}
        ];
        
        const bundles = extractBundles([p1, p2]);
        expect(bundles).toHaveLength(1);
        expect(bundles[0]!.cables).toBe(2);
        expect(bundles[0]!.path).toHaveLength(4);
    });
});
