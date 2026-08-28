# Batch 045 - Q.Wave 1a - `router-core`

> **FRESH SESSION REQUIRED.** Run this wave in a **new chat / new agent with no prior context**. This file
> is fully self-contained - it is the only instruction you need. Do **not** carry state from a previous wave.
> One wave = one new session = one branch = one commit = one TAG audit.
>
> **Engine class:** Pro (Gemini Pro 1.5 in Antigravity, complex algorithmic).

1. **One wave = one branch = one commit.** Branch `cu-b045-q-w1a-router-core` off current `main`. Squash everything into one commit.
2. **Verify before you act.**
3. **Modify only the files listed in `Files:`.**
4. **Minimal diff.**
5. **Acceptance gate:** `pnpm lint` clean · `pnpm typecheck` clean · `pnpm vitest run app/src/router/core.test.ts` clean.
6. **Licence firewall (voids the wave if broken):** never open, quote, or port from `C:\Claude\EasySchematic\**`. **DO NOT OPEN ANY FILE IN `app/src/projection` OR `app/src/views` AS THIS IS A CLEAN-ROOM ALGORITHM REWRITE.**
7. **NCE is the store.**
8. **Secrets:** never commit tokens.
9. **Turbo-mode discipline:** commit on your branch is the last state-changing command.
10. **Craft gate:** functions small and single-purpose.
11. **Report format:** files changed, verbatim gate output, what you did NOT verify.

**Skills:** Algorithms (A* search), TypeScript.
**Depends on:** B3.
**Reads (context, do not edit):** None - this is a clean-room algorithmic implementation.
**Files (exactly these - nothing else):**
- `app/src/router/core.ts`
- `app/src/router/core.test.ts`

**Goal:** Implement a pure-function A* pathfinding algorithm on a uniform grid with direction-in-state and turn penalties.

**Steps:**
1. In `app/src/router/core.ts`, implement an A* search algorithm `findPath(gridWidth, gridHeight, startX, startY, endX, endY, obstacles)`.
2. The search state must include the current direction (e.g. `UP`, `DOWN`, `LEFT`, `RIGHT`) to allow turn penalties.
3. Movement is orthogonal only. A turn (changing direction) incurs a cost penalty (e.g. +10 cost) compared to moving straight.
4. Return an array of coordinates `[{x, y}]` representing the path.
5. Write synthetic tests in `app/src/router/core.test.ts` verifying straight paths, paths avoiding obstacles, and paths minimizing turns (e.g., zigzag vs straight+turn).

**Acceptance:** `pnpm lint && pnpm typecheck && pnpm vitest run app/src/router/core.test.ts` clean.

## Final (the TAG gate - this is the ONLY way this wave reaches DONE):
Follow the standard final rules.
