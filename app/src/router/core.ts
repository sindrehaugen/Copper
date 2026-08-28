export interface Point {
    x: number;
    y: number;
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'NONE';

interface State {
    x: number;
    y: number;
    direction: Direction;
    gScore: number;
    fScore: number;
    parent: State | null;
}

export function findPath(
    gridWidth: number,
    gridHeight: number,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    obstacles: Point[]
): Point[] {
    if (startX === endX && startY === endY) {
        return [{ x: startX, y: startY }];
    }

    const obstacleSet = new Set<string>();
    for (const obs of obstacles) {
        obstacleSet.add(`${obs.x},${obs.y}`);
    }

    if (obstacleSet.has(`${startX},${startY}`) || obstacleSet.has(`${endX},${endY}`)) {
        return [];
    }

    if (startX < 0 || startX >= gridWidth || startY < 0 || startY >= gridHeight ||
        endX < 0 || endX >= gridWidth || endY < 0 || endY >= gridHeight) {
        return [];
    }

    const startState: State = {
        x: startX,
        y: startY,
        direction: 'NONE',
        gScore: 0,
        fScore: heuristic(startX, startY, endX, endY),
        parent: null
    };

    const openSet: State[] = [startState];
    const openSetMap = new Map<string, State>();
    openSetMap.set(getStateKey(startX, startY, 'NONE'), startState);

    const closedSet = new Set<string>();

    while (openSet.length > 0) {
        let currentIndex = 0;
        for (let i = 1; i < openSet.length; i++) {
            if (openSet[i]!.fScore < openSet[currentIndex]!.fScore) {
                currentIndex = i;
            }
        }
        
        const current = openSet.splice(currentIndex, 1)[0]!;
        const stateKey = getStateKey(current.x, current.y, current.direction);
        openSetMap.delete(stateKey);

        if (current.x === endX && current.y === endY) {
            return reconstructPath(current);
        }

        closedSet.add(stateKey);

        const neighbors = getNeighbors(current.x, current.y, gridWidth, gridHeight);
        
        for (const neighbor of neighbors) {
            if (obstacleSet.has(`${neighbor.x},${neighbor.y}`)) {
                continue;
            }
            
            const neighborKey = getStateKey(neighbor.x, neighbor.y, neighbor.dir);
            if (closedSet.has(neighborKey)) {
                continue;
            }

            const turnCost = (current.direction === 'NONE' || current.direction === neighbor.dir) ? 0 : 10;
            const tentativeGScore = current.gScore + 1 + turnCost;

            const existingOpen = openSetMap.get(neighborKey);
            
            if (!existingOpen) {
                const neighborState: State = {
                    x: neighbor.x,
                    y: neighbor.y,
                    direction: neighbor.dir,
                    gScore: tentativeGScore,
                    fScore: tentativeGScore + heuristic(neighbor.x, neighbor.y, endX, endY),
                    parent: current
                };
                openSet.push(neighborState);
                openSetMap.set(neighborKey, neighborState);
            } else if (tentativeGScore < existingOpen.gScore) {
                existingOpen.gScore = tentativeGScore;
                existingOpen.fScore = tentativeGScore + heuristic(neighbor.x, neighbor.y, endX, endY);
                existingOpen.parent = current;
            }
        }
    }

    return [];
}

function heuristic(x1: number, y1: number, x2: number, y2: number): number {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

function getStateKey(x: number, y: number, dir: Direction): string {
    return `${x},${y},${dir}`;
}

function getNeighbors(x: number, y: number, width: number, height: number): { x: number, y: number, dir: Direction }[] {
    const neighbors: { x: number, y: number, dir: Direction }[] = [];
    if (x > 0) neighbors.push({ x: x - 1, y, dir: 'LEFT' });
    if (x < width - 1) neighbors.push({ x: x + 1, y, dir: 'RIGHT' });
    if (y > 0) neighbors.push({ x, y: y - 1, dir: 'UP' });
    if (y < height - 1) neighbors.push({ x, y: y + 1, dir: 'DOWN' });
    return neighbors;
}

function reconstructPath(current: State): Point[] {
    const path: Point[] = [];
    let curr: State | null = current;
    while (curr !== null) {
        path.push({ x: curr.x, y: curr.y });
        curr = curr.parent;
    }
    return path.reverse();
}
