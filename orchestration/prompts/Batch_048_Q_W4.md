# Batch 048 - Q.W4: Quality Score (Ugliness)
## Context
We need a metric to evaluate the visual quality of our A* routing. We want an "ugliness score" that is strictly outside-in: it looks at the final output paths and the node bounding boxes, and penalizes them for crossing nodes, having too many turns, being too long, or overlapping where they shouldn't. This function must be completely blind to the internal state of the A* router (no reading the `RouterGrid` cost map).

## Files:
app/src/router/quality.ts
app/src/router/quality.test.ts

## Rules
1. **Scope:** ONLY the listed files.
2. **IP Firewall:** Absolutely NO EasySchematic paths or Norwegian words.
3. **Purity:** Pure functions only.
4. **Clean-room (T3):** DO NOT look at `app/src/router/core.ts` or `app/src/router/integration.ts`.
5. **No Typescript Excursions:** Export `evaluateQuality(paths: Point[][], nodeBounds: Rect[]): number`.

## Steps
1. Create `app/src/router/quality.ts`.
2. Define `export interface Rect { x: number; y: number; width: number; height: number; }` and `export interface Point { x: number; y: number; }`.
3. Implement `export function evaluateQuality(paths: Point[][], nodeBounds: Rect[]): number`
4. The score is a sum of penalties:
   - `1` point per unit of length for every path.
   - `10` points for every 90-degree turn.
   - `100` points if a path segment intersects with any `nodeBounds`.
5. Create `app/src/router/quality.test.ts` and test a straight line, a line with turns, and a line intersecting a node.

## Acceptance
`pnpm lint && pnpm typecheck && pnpm vitest run app/src/router/quality.test.ts`

## Final
Return a summary of what you did. Include your §6.4 mutation test results (mutate a penalty constant).
