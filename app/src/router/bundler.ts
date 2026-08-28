import { Point } from './core';

export interface Bundle {
    path: Point[];
    cables: number;
}

export function extractBundles(paths: Point[][]): Bundle[] {
    const edgeToPaths = new Map<string, Set<number>>();
    
    const pointToStr = (p: Point) => `${p.x},${p.y}`;
    const getEdgeKey = (p1: Point, p2: Point) => {
        const s1 = pointToStr(p1);
        const s2 = pointToStr(p2);
        return s1 < s2 ? `${s1}|${s2}` : `${s2}|${s1}`;
    };

    paths.forEach((path, pathId) => {
        for (let i = 0; i < path.length - 1; i++) {
            const key = getEdgeKey(path[i]!, path[i+1]!);
            let pathSet = edgeToPaths.get(key);
            if (!pathSet) {
                pathSet = new Set<number>();
                edgeToPaths.set(key, pathSet);
            }
            pathSet.add(pathId);
        }
    });

    const groupToEdges = new Map<string, string[]>();
    
    for (const [edgeKey, pathSet] of edgeToPaths.entries()) {
        if (pathSet.size >= 2) {
            const groupKey = Array.from(pathSet).sort((a, b) => a - b).join(',');
            let edges = groupToEdges.get(groupKey);
            if (!edges) {
                edges = [];
                groupToEdges.set(groupKey, edges);
            }
            edges.push(edgeKey);
        }
    }

    const bundles: Bundle[] = [];

    for (const [groupKey, edges] of groupToEdges.entries()) {
        const cablesCount = groupKey.split(',').length;
        
        const adj = new Map<string, string[]>();
        for (const edgeKey of edges) {
            const [p1Str, p2Str] = edgeKey.split('|');
            if (!adj.has(p1Str!)) adj.set(p1Str!, []);
            if (!adj.has(p2Str!)) adj.set(p2Str!, []);
            adj.get(p1Str!)!.push(p2Str!);
            adj.get(p2Str!)!.push(p1Str!);
        }
        
        const visitedNodes = new Set<string>();

        for (const node of adj.keys()) {
            if (adj.get(node)!.length === 1 && !visitedNodes.has(node)) {
                const pathStr: string[] = [node];
                visitedNodes.add(node);
                
                let curr = node;
                let prev: string | null = null;
                
                while (true) {
                    const neighbors = adj.get(curr)!;
                    const next = neighbors.find(n => n !== prev);
                    if (!next) break;
                    
                    pathStr.push(next);
                    visitedNodes.add(next);
                    
                    prev = curr;
                    curr = next;
                }
                
                if (pathStr.length - 1 >= 3) {
                    bundles.push({
                        path: pathStr.map(parsePoint),
                        cables: cablesCount
                    });
                }
            }
        }
        
        for (const node of adj.keys()) {
            if (!visitedNodes.has(node)) {
                const pathStr: string[] = [node];
                visitedNodes.add(node);
                
                let curr = node;
                let prev: string | null = null;
                
                while (true) {
                    const neighbors = adj.get(curr)!;
                    const next = neighbors.find(n => n !== prev && !visitedNodes.has(n));
                    if (!next) {
                        const lastNeighbor = neighbors.find(n => n !== prev);
                        if (lastNeighbor) {
                            pathStr.push(lastNeighbor);
                        }
                        break;
                    }
                    
                    pathStr.push(next);
                    visitedNodes.add(next);
                    
                    prev = curr;
                    curr = next;
                }
                
                if (pathStr.length - 1 >= 3) {
                    bundles.push({
                        path: pathStr.map(parsePoint),
                        cables: cablesCount
                    });
                }
            }
        }
    }

    return bundles;
}

function parsePoint(str: string): Point {
    const [x, y] = str.split(',').map(Number);
    return { x: x!, y: y! };
}
