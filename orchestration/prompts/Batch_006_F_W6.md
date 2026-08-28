# Batch 006 — F.Wave 6 — `fixtures-rig`

> **FRESH SESSION REQUIRED.** Fully self-contained brief; one wave = one session = one branch = one commit = one TAG.
> **Engine class:** Flash (Gemini Flash 3.7 High, turbo). Unwritten design decision → STOP and report.

Rules 1–11: as in `orchestration/_TEMPLATE.md`, verbatim. Branch: `cu-b006-f-w6-fixtures-rig`.

**Skills:** nodejs-best-practices (primary), typescript-pro
**Depends on:** B5
**Reads (context, do not edit):** `app/src/exchange/easyschematic/read.ts` · `steps-ai\frontend\tests\malerigg\README.md` + `kjor.mjs` (PORT-list harness — port the *harness idea*: headless, fast, JSON out; the scoring internals arrive with the Q lane, NOT now)
**Files (exactly these):** `rig/package.json` (workspace member), `rig/run.mjs` (new), `rig/run.test.mjs` (new), `rig/README.md` (new), `app/tests/fixtures/av-fasit/` (copy the REMAINING 13 fixture sheets from `steps-ai\frontend\tests\fixtures\av-fasit\`), `pnpm-lock.yaml` (workspace registration only)
**Goal:** `node rig/run.mjs` loads all 15 fixture sheets through B5, and emits one JSON to stdout: per-sheet `{sheet, devices, ports, cables, locations, unmappedFieldCount, skippedObjects}` + totals + `elapsedMs`. **No browser, no DOM, under 60 seconds total.** This is the chassis the Q lane will bolt scoring onto; it must not contain any scoring, routing, or layout logic (that would pre-empt clean-room waves — if you feel the urge, STOP and report).

**Steps:**
1. Copy the 13 sheets; record each file's byte size in `rig/README.md` (provenance table: filename, size, copied-from path, date).
2. Implement `run.mjs` (plain Node, imports the built app model via tsx or a tiny esbuild step — pick tsx as a devDependency, MIT).
3. `run.test.mjs`: executes the rig as a child process, asserts 15/15 sheets present in output, JSON schema of the output pinned (zod), `elapsedMs < 60000`.
4. Gate; commit.

**Acceptance:** rig runs 15/15 with stable counts (run twice, byte-identical JSON apart from `elapsedMs`); test green.

**§6.4 mutation table (minimum):** (1) remove one fixture in a scratch copy → 15/15 assertion RED; (2) corrupt one fixture's JSON → that sheet appears in `skippedObjects`/error section and the pinned schema still validates (proving partial failure is reported, not fatal).

## Final: as `orchestration/_TEMPLATE.md` §Final. Note explicitly: determinism verified only on your machine/Node version — cross-platform determinism not verified.
