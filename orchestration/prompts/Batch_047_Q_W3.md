# Batch 047 - Q.W3: Bundling Proposals
## Context
A* routing now deposits costs/discounts into a global grid (B46). We now want to extract "Bundles" from these overlapping paths to present them to the user.

## Files:
app/src/router/bundler.ts
app/src/router/bundler.test.ts

## Steps
1. Create `app/src/router/bundler.ts`.
2. Implement `extractBundles(paths: Point[][]): Bundle[]` where a Bundle is a shared segment of >= 2 cables that is >= 3 grid units long.
3. Export `interface Bundle { path: Point[]; cables: number; }`
4. Add comprehensive tests in `app/src/router/bundler.test.ts`.

## Acceptance
`pnpm lint && pnpm typecheck && pnpm vitest run app/src/router/bundler.test.ts`

## Final
Return files changed, verbatim gate output, what was not verified.
