export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export function evaluateQuality(paths: Point[][], nodeBounds: Rect[]): number {
  let penalty = 0;

  for (const path of paths) {
    if (path.length === 0) continue;

    for (let i = 0; i < path.length - 1; i++) {
      const p1 = path[i];
      const p2 = path[i + 1];
      if (!p1 || !p2) continue;

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      penalty += len;
      
      for (const node of nodeBounds) {
        if (segmentIntersectsRect(p1, p2, node)) {
          penalty += 100;
        }
      }
    }

    for (let i = 0; i < path.length - 2; i++) {
      const p1 = path[i];
      const p2 = path[i + 1];
      const p3 = path[i + 2];
      if (!p1 || !p2 || !p3) continue;
      
      const v1x = p2.x - p1.x;
      const v1y = p2.y - p1.y;
      const len1 = Math.sqrt(v1x * v1x + v1y * v1y);

      const v2x = p3.x - p2.x;
      const v2y = p3.y - p2.y;
      const len2 = Math.sqrt(v2x * v2x + v2y * v2y);
      
      if (len1 > 0 && len2 > 0) {
        const dot = (v1x * v2x + v1y * v2y) / (len1 * len2);
        if (Math.abs(dot) < 0.001) {
          penalty += 10;
        }
      }
    }
  }

  return penalty;
}

function segmentIntersectsRect(p1: Point, p2: Point, rect: Rect): boolean {
  const rMinX = rect.x;
  const rMaxX = rect.x + rect.width;
  const rMinY = rect.y;
  const rMaxY = rect.y + rect.height;

  const minX = Math.min(p1.x, p2.x);
  const maxX = Math.max(p1.x, p2.x);
  const minY = Math.min(p1.y, p2.y);
  const maxY = Math.max(p1.y, p2.y);

  if (maxX < rMinX || minX > rMaxX) return false;
  if (maxY < rMinY || minY > rMaxY) return false;

  const edges = [
    {a: {x: rMinX, y: rMinY}, b: {x: rMaxX, y: rMinY}},
    {a: {x: rMaxX, y: rMinY}, b: {x: rMaxX, y: rMaxY}},
    {a: {x: rMaxX, y: rMaxY}, b: {x: rMinX, y: rMaxY}},
    {a: {x: rMinX, y: rMaxY}, b: {x: rMinX, y: rMinY}}
  ];
  
  for (const edge of edges) {
    if (linesIntersect(p1, p2, edge.a, edge.b)) return true;
  }
  
  if (pointInRect(p1, rect) || pointInRect(p2, rect)) return true;
  
  return false;
}

function linesIntersect(p1: Point, p2: Point, p3: Point, p4: Point): boolean {
  const d = (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x);
  if (d === 0) return false;
  
  const u = ((p3.x - p1.x) * (p4.y - p3.y) - (p3.y - p1.y) * (p4.x - p3.x)) / d;
  const v = ((p3.x - p1.x) * (p2.y - p1.y) - (p3.y - p1.y) * (p2.x - p1.x)) / d;
  
  return u >= 0 && u <= 1 && v >= 0 && v <= 1;
}

function pointInRect(p: Point, rect: Rect): boolean {
  return p.x >= rect.x && p.x <= rect.x + rect.width &&
         p.y >= rect.y && p.y <= rect.y + rect.height;
}
