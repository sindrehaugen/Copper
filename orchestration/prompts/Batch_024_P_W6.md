# Copper Orchestration — Batch 024 — P.W6 naive-edges

## Goal
Implement a naive edge renderer for the React Flow canvas (B22). It should draw simple bezier or step paths between nodes using React Flow's built-in edge types. A robust routing engine (Q lane) will replace this in the future, but for now we just need basic connections to render the topology.
Map the \dges\ array from \	oFlow\ into React Flow's standard \Edge\ objects, configuring them to use a smooth step or bezier path.

## Files (exactly these — nothing else)
- \pp/src/projection/edges.ts\
- \pp/src/projection/edges.test.ts\

## 11 Strict Rules
1. Never import \asyschematic\ directly in \pp/\.
2. Do not mutate incoming objects.
3. Keep logic pure where possible.
4. Export the specific functions requested.
5. Use existing tokens/theme.
6. Write strict assertions.
7. Follow the architecture exactly.
8. Stop and Report on any blocker.
9. No PRs, no pushes.
10. Strict clean-room.
11. No AI toolchain pollution.

## Steps
1. Create \dges.ts\ providing a utility to enhance the raw edges from \	oFlow\ with visual React Flow properties (type: 'smoothstep', styling, etc.).
2. Test the mapping logic with Vitest.

## Acceptance
- \pnpm lint\ and \	sc -b\ must pass.
- \itest run\ must pass.

## §6.4 Mutation table
- Mutate the edge type to an invalid string; verify tests catch it.

## Final
Report back with:
- Files changed
- Verbatim gate output
- Mutation table
- What you did NOT verify
- Anything you STOPped on
