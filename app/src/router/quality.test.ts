import { describe, it, expect } from 'vitest';
import { evaluateQuality, Rect } from './quality';

describe('evaluateQuality', () => {
  it('should score a straight line with only length penalty', () => {
    const paths = [
      [{ x: 0, y: 0 }, { x: 10, y: 0 }]
    ];
    const nodeBounds: Rect[] = [];
    const score = evaluateQuality(paths, nodeBounds);
    expect(score).toBe(10); // length is 10
  });

  it('should score a line with turns', () => {
    const paths = [
      [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }]
    ];
    const nodeBounds: Rect[] = [];
    const score = evaluateQuality(paths, nodeBounds);
    // length is 10 + 10 = 20
    // 1 turn of 90 degrees = 10
    expect(score).toBe(30);
  });

  it('should penalize intersections with nodes', () => {
    const paths = [
      [{ x: 0, y: 5 }, { x: 10, y: 5 }]
    ];
    const nodeBounds: Rect[] = [
      { x: 4, y: 4, width: 2, height: 2 }
    ];
    const score = evaluateQuality(paths, nodeBounds);
    // length = 10
    // intersection penalty = 100
    expect(score).toBe(110);
  });
});
