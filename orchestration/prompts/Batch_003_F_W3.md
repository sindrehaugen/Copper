# Batch 003 — F.Wave 3 — `geometry-core`

> **FRESH SESSION REQUIRED.** Fully self-contained brief; one wave = one session = one branch = one commit = one TAG.
> **Engine class:** Flash (Gemini Flash 3.7 High, turbo). Unwritten design decision → STOP and report.

Rules 1–11: as in `orchestration/_TEMPLATE.md`, verbatim. Branch: `cu-b003-f-w3-geometry-core`.

**Skills:** typescript-pro (primary)
**Depends on:** B1
**Reads (context, do not edit):** `docs/decisions/0002-frontend-stack.md` (structural rules 2–3)
**Files (exactly these):** `app/src/model/geometry.ts` (chokepoint owner), `app/src/model/geometry.test.ts`
**Goal:** the single source of drawing geometry. One exported `PITCH = 24` (px). Card geometry derived so **ports land exactly on grid lines**: `CARD_WIDTH`, `CARD_HEADER_H`, `CARD_PAD_Y`, `PORT_ROW_H` — every exported dimension an integer multiple of `PITCH`, plus the derived invariant that the first port dot's center offset (`CARD_HEADER_H + CARD_PAD_Y + PORT_ROW_H / 2`) is itself a multiple of `PITCH`. One `PORT_DOT_INSET` constant — the ONLY definition of "distance from card edge to port dot" any renderer may use. A pure `portDotPosition(cardX, cardY, portIndex, side)` helper returning grid-aligned coordinates.

Why this is a wave of its own: the prior-art system measured **70% of cable corners falling off the router's search grid** when card dimensions drifted 19px off-pitch, and shipped four renderers with four private inset copies whose cables visibly missed their ports. This file is the ratchet that makes both impossible.

**Steps:**
1. Author `geometry.ts` with the constants above, each with a one-line comment stating its invariant (not its value).
2. Author the ratchet test: programmatically iterate **every numeric export** of the module (`Object.entries`) asserting `value % PITCH === 0` OR the export is explicitly listed in a `NON_GRID_EXPORTS` set (ship it empty; additions require a brief that justifies them). Assert the first-port-center invariant. Assert `portDotPosition` returns multiples of `PITCH` for indices 0–7 on both sides.
3. Run the gate; commit.

**Acceptance:** `pnpm vitest run app/src/model/geometry.test.ts` green; the iterate-all-exports ratchet demonstrably covers new exports (see mutation 2).

**§6.4 mutation table (minimum):** (1) set `CARD_HEADER_H` to an off-pitch value in a scratch copy → ratchet RED; (2) ADD a new off-pitch export `SCRATCH_DIM = 25` → ratchet RED **without editing the test** (proves the ratchet sees future exports); (3) break `portDotPosition`'s side handling → its test RED.

## Final: as `orchestration/_TEMPLATE.md` §Final — STOP and report with the full report format.
