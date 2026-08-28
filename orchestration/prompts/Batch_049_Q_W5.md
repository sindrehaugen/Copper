# Batch 049 - Q.W5: Portfolio Worker
## Context
We need to generate paths for our layout. We have the router core (B45), integration (B45b), penalty zones (B46), bundler (B47), and quality score evaluator (B48). To avoid blocking the main thread during heavy A* computations, we will run multiple routing strategy variations in a Web Worker, score them using the B48 evaluator, and return the best overall strategy (the one with the lowest ugliness score). 

## Files:
app/src/router/worker.ts
app/src/router/worker.test.ts

## Rules
1. **Scope:** ONLY the listed files.
2. **IP Firewall:** Absolutely NO EasySchematic paths or Norwegian words.
3. **Purity:** Pure functions and worker message passing only. No side effects.
4. **Clean-room:** Strictly adhere to the inputs/outputs.

## Steps
1. In `app/src/router/worker.ts`, create a Web Worker that listens for a `RouteRequest` containing nodes, edges, bounds, and strategy parameters.
2. The worker should invoke the router (from `core.ts` / `integration.ts`), generate the paths, and evaluate them using `evaluateQuality` from `quality.ts`.
3. Generate at least 3 variations (e.g. by tweaking grid size, step cost, or turn penalties slightly). Pick the one with the lowest `evaluateQuality` score.
4. Post the best result back via `postMessage`.
5. In `app/src/router/worker.test.ts`, mock the Web Worker API and ensure it receives a message, runs the variations (mocked router calls), and returns the lowest scored variation.

## Acceptance
`pnpm lint && pnpm typecheck && pnpm vitest run app/src/router/worker.test.ts`

## Final
Return a summary of what you did. Include your §6.4 mutation test results (mutate the logic that picks the lowest score to pick the highest score instead).
