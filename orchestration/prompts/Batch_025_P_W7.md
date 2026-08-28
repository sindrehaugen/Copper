# Copper Orchestration — Batch 025 — P.W7 the-premise-proof

## Goal
End-to-end integration test proving the projection pipeline. The test must read an EasySchematic fixture (using B5's reader), pipe it through B21's \	oFlow\, run B23's \lk-layout\, and apply B24's naive edges. This proves the core premise: we can losslessly ingest an external schematic and render it as a directed graph.

## Files (exactly these — nothing else)
- \pp/src/projection/e2e.test.ts\

## 11 Strict Rules
1. Never import \asyschematic\ directly in \pp/\ except in tests where explicitly allowed as a fixture.
2. Do not mutate incoming objects.
3. Keep logic pure where possible.
4. Export the specific components requested.
5. Use existing tokens/theme.
6. Write strict assertions.
7. Follow the architecture exactly.
8. Stop and Report on any blocker.
9. No PRs, no pushes.
10. Strict clean-room.
11. No AI toolchain pollution.

## Steps
1. Create \2e.test.ts\ in \pp/src/projection/\.
2. Import a complex fixture from \pp/tests/fixtures/av-fasit/\.
3. Run the full pipeline: \ead(fixture)\ -> \	oFlow(document)\ -> \layout(nodes, edges)\ -> \nhanceEdges(edges)\.
4. Assert that the final nodes have valid \x\ and \y\ coordinates (not NaN, not 0 if they should be spread out) and that edges are correctly typed.

## Acceptance
- \pnpm lint\ and \	sc -b\ must pass.
- \itest run\ must pass.

## §6.4 Mutation table
- Break the layout engine call; verify the test fails when nodes are stuck at 0,0.

## Final
Report back with:
- Files changed
- Verbatim gate output
- Mutation table
- What you did NOT verify
- Anything you STOPped on
