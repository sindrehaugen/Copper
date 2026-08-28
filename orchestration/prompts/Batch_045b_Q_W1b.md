# Batch 045b - Q.Wave 1b - `router-integration`

> **FRESH SESSION REQUIRED.** Run this wave in a **new chat / new agent with no prior context**. This file
> is fully self-contained - it is the only instruction you need. Do **not** carry state from a previous wave.
> One wave = one new session = one branch = one commit = one TAG audit.
>
> **Engine class:** Pro (Gemini Pro 1.5 in Antigravity).

1. **One wave = one branch = one commit.** Branch `cu-b045b-q-w1b-router-integration` off current `main`. Squash everything into one commit.
2. **Verify before you act.**
3. **Modify only the files listed in `Files:`.**
4. **Minimal diff.**
5. **Acceptance gate:** `pnpm lint` clean · `pnpm typecheck` clean · `pnpm vitest run app/src/router/integration.test.ts` clean.
6. **Licence firewall (voids the wave if broken):** never open, quote, or port from `C:\Claude\EasySchematic\**`.
7. **NCE is the store.**
8. **Secrets:** never commit tokens.
9. **Turbo-mode discipline:** commit on your branch is the last state-changing command.
10. **Craft gate:** functions small and single-purpose.
11. **Report format:** files changed, verbatim gate output, what you did NOT verify.

**Skills:** Algorithms, TypeScript, React Flow.
**Depends on:** B45, B24.
**Reads (context, do not edit):** `app/src/router/core.ts` (for the A* function), `app/src/views/canvas/CanvasView.tsx` (for how edges are rendered).
**Files (exactly these - nothing else):**
- `app/src/router/integration.ts`
- `app/src/router/integration.test.ts`

**Goal:** Integrate the pure A* pathfinding (B45) with the React Flow canvas (B24), providing a function to map a React Flow edge to an A* path (accounting for node bounds as obstacles). Provide U-turn logic and per-cable expansion budgeting.

**Steps:**
1. In `app/src/router/integration.ts`, implement `routeEdge(sourceNode, targetNode, allNodes, gridParams)`.
2. It must extract the bounding boxes of all nodes (treating them as obstacles) and map the source and target handle positions to grid coordinates.
3. Call `findPath` from `core.ts`.
4. Return an array of SVG path commands (e.g. `M x y L x2 y2`) or coordinates for React Flow.
5. In `app/src/router/integration.test.ts`, write synthetic tests verifying the integration logic with mock nodes.

**Acceptance:** `pnpm lint && pnpm typecheck && pnpm vitest run app/src/router/integration.test.ts` clean.

## Final (the TAG gate - this is the ONLY way this wave reaches DONE):
Follow the standard final rules.
