# Copper Orchestration — Batch 026 — P.W8 integration-proof

## Goal
End-to-end integration test of the integration sheet fetching from NCE via B20 client, projecting via B21/B22/B23, and rendering. This serves as the final proof for Phase 2 before HARD-STOP 3.

## Files (exactly these — nothing else)
- \pp/src/projection/integration.test.ts\

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
1. Create \eidekke.test.ts\ in \pp/src/projection/\.
2. Mock the B20 client to return the parsed integration payload.
3. Run the full projection and layout pipeline.
4. Verify the final node count and edge count matches the expected numbers for the integration sheet.

## Acceptance
- \pnpm lint\ and \	sc -b\ must pass.
- \itest run\ must pass.

## §6.4 Mutation table
- Mutate the expected node count; verify test fails.

## Final
Report back with:
- Files changed
- Verbatim gate output
- Mutation table
- What you did NOT verify
- Anything you STOPped on
