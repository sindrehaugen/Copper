import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { RouteRequest, RoutingEdge as Edge } from './worker';
import type { RoutingNode as Node } from './integration';

vi.mock('./integration', () => ({
    routeEdge: vi.fn((_src, _tgt, _srcHandle, _tgtHandle, _nodes, _grid, v: unknown) => {
        const strat = v as { gridSize: number };
        return "M 0 0 L " + strat.gridSize + " " + strat.gridSize;
    })
}));

vi.mock('./quality', () => ({
    evaluateQuality: vi.fn((paths) => {
        const firstPoint = paths[0]?.[1];
        if (firstPoint?.x === 20) return 5;
        if (firstPoint?.x === 15) return 10;
        return 15;
    })
}));

describe('Router Worker', () => {
    let mockPostMessage: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();
        mockPostMessage = vi.fn();
        
        (global as unknown as { self: unknown }).self = {
            addEventListener: vi.fn(),
            postMessage: mockPostMessage
        };
    });

    it('should receive message, run variations and return lowest score', async () => {
        vi.resetModules();
        await import('./worker');

        const listener = ((global as unknown as { self: { addEventListener: ReturnType<typeof vi.fn> } }).self.addEventListener).mock.calls[0]?.[1];
        
        const request: RouteRequest = {
            nodes: [
                { id: '1', position: { x: 0, y: 0 }, data: {} } as Node,
                { id: '2', position: { x: 100, y: 100 }, data: {} } as Node
            ],
            edges: [
                { id: 'e1', source: '1', target: '2' } as Edge
            ],
            bounds: [],
            strategyParams: {}
        };

        listener({ data: request } as MessageEvent);

        expect(mockPostMessage).toHaveBeenCalledTimes(1);
        const result = mockPostMessage.mock.calls[0]?.[0];

        expect(result.bestScore).toBe(5);
        expect(result.bestStrategy.gridSize).toBe(20);
        expect(result.bestPaths).toHaveLength(1);
    });
});
