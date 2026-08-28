# Batch 023 - P.Wave 5 - `elk-layout`

> **FRESH SESSION REQUIRED.** Fully self-contained brief; one wave = one session = one branch = one commit = one TAG.
> **Engine class:** Flash (Gemini Flash 3.7 High, turbo). Unwritten design decision -> STOP and report.

Rules 1-11: as in `orchestration/_TEMPLATE.md`, verbatim. Branch: `cu-b023-p-w5-elk-layout`.

**Skills:** nodejs-best-practices, algorithms
**Depends on:** B21
**Reads (context, do not edit):** `app/src/projection/toFlow.ts`
**Files (exactly these):** `app/src/projection/layout.ts` (new), `app/src/projection/layout.test.ts` (new), `app/package.json`, `pnpm-lock.yaml`
**Goal:** Implement layered auto-layout using `elkjs` for unpositioned designs. 

**Steps:**
1. Install `elkjs` (EPL-2.0, accepted per ADR) into `app/`.
2. Implement `applyElkLayout(nodes, edges)` in `app/src/projection/layout.ts` that takes an array of React Flow nodes and edges, passes them to Elk's layout engine (using `elk.algorithm = 'layered'`, `elk.direction = 'RIGHT'`), and returns a Promise resolving to the nodes with updated `x, y` positions.
3. Write `layout.test.ts` to verify the layout executes and positions nodes differently from `0,0`.
4. Gate; commit.

**Acceptance:** `elkjs` runs successfully and mutates node positions based on edges.

**§6.4 mutation table:** (1) hardcode return positions to 0,0, fail the test that asserts layout changed the coordinates.

## Final: as `orchestration/_TEMPLATE.md` §Final.