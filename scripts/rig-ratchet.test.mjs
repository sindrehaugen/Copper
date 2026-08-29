import { test, expect } from 'vitest';
import { evaluateFixtures, FLOOR_SCORE } from './rig-ratchet.mjs';

test('evaluateFixtures correctly sums scores', () => {
    const fixtures = [
        { paths: [[{ x: 0, y: 0 }, { x: 3, y: 4 }]], nodeBounds: [] },
        { paths: [[{ x: 0, y: 0 }, { x: 6, y: 8 }]], nodeBounds: [] }
    ];
    
    const score = evaluateFixtures(fixtures);
    expect(score).toBe(15);
});

test('FLOOR_SCORE is a number', () => {
    expect(typeof FLOOR_SCORE).toBe('number');
});
