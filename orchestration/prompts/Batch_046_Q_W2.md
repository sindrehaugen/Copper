# Batch 046 - Q.Wave 2 - `penalty-zones`

> **FRESH SESSION REQUIRED.** Run this wave in a **new chat / new agent with no prior context**. This file
> is fully self-contained - it is the only instruction you need. Do **not** carry state from a previous wave.
> One wave = one new session = one branch = one commit = one TAG audit.
>
> **Engine class:** Pro (Gemini Pro 1.5 in Antigravity).

1. **One wave = one branch = one commit.** Branch `cu-b046-q-w2-penalty-zones` off current `main`. Squash everything into one commit.
2. **Verify before you act.**
3. **Modify only the files listed in `Files:`.**
4. **Minimal diff.**
5. **Acceptance gate:** `pnpm lint` clean · `pnpm typecheck` clean · `pnpm vitest run app/src/router/core.test.ts` clean.
6. **Licence firewall (voids the wave if broken):** never open, quote, or port from `C:\Claude\EasySchematic\**`. 
7. **NCE is the store.**
8. **Secrets:** never commit tokens.
9. **Turbo-mode discipline:** commit on your branch is the last state-changing command.
10. **Craft gate:** functions small and single-purpose.
11. **Report format:** files changed, verbatim gate output, what you did NOT verify.

**Skills:** Algorithms, Pathfinding, TypeScript.
**Depends on:** B45b.
**Reads (context, do not edit):** `app/src/router/integration.ts`.
**Files (exactly these - nothing else):**
- `app/src/router/core.ts`
- `app/src/router/core.test.ts`

**Goal:** Modify the A* algorithm so routed cables "deposit cost" into the grid. This makes sequential routing globally aware; subsequent cables will naturally prefer to follow existing cable bundles (if cost deposit is negative, i.e., a discount for bundling) or avoid them (if cost deposit is positive, i.e., penalty for congestion). For Copper, we want a **discount** for bundling (e.g. -2 cost per existing cable on that edge, up to a limit).

**Steps:**
1. In `app/src/router/core.ts`, modify `findPath` to accept an optional `costGrid: Map<string, number>` (mapping coordinate keys to a cost delta).
2. When calculating the neighbor `gScore`, add the `costGrid` value for that cell.
3. Export a utility `updateCostGrid(costGrid, path)` that takes a routed path and applies the bundling discount (e.g. subtracting 2 from the cost of those cells, ensuring the total cost never drops below 1 to maintain admissibility).
4. In `app/src/router/core.test.ts`, add tests proving that a second path will route slightly out of its way to join an established bundle (deposit cost).

**Acceptance:** `pnpm lint && pnpm typecheck && pnpm vitest run app/src/router/core.test.ts` clean.

## Final (the TAG gate - this is the ONLY way this wave reaches DONE):
Follow the standard final rules.
