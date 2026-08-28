# Batch 021 — P.Wave 3 — `to-flow`

> **FRESH SESSION REQUIRED.** Run this wave in a **new chat / new agent with no prior context**. This file
> is fully self-contained — it is the only instruction you need. One wave = one new session = one branch =
> one commit = one TAG audit.
>
> **Engine class:** Flash (Gemini Flash 3.7 High in Antigravity, turbo). If a step forces a design choice
> that is not written here, **STOP and report** — do not improvise.

Branch: `cu-b021-p-w3-to-flow`.

**Skills:** typescript-pro
**Depends on:** B3, B4b
**Reads (context, do not edit):** `app/src/model/schema.ts`, `app/src/model/geometry.ts`
**Files (exactly these — nothing else):** `app/package.json` (modified), `app/src/projection/toFlow.ts` (new), `app/src/projection/toFlow.test.ts` (new)
**Goal:** Pure `toFlow(document, layout)` projection (PORT-list port), `initialWidth/Height` seeding (steps-ai ADR 0021 trap).

**Steps:**
1. Install `@xyflow/react` and `@xyflow/system` in `app/`.
2. Author `app/src/projection/toFlow.ts` which exports a pure function `toFlow(document: DesignDocument, layout?: LayoutData)`.
3. The function must map `DesignDocument` devices to React Flow `Node` arrays, and `Cable`s to `Edge` arrays.
4. Ensure node `initialWidth` and `initialHeight` are seeded to prevent React Flow measure-on-mount layout shifts (the ADR 0021 trap).
5. Run the full gate locally; commit.

**Acceptance:** `pnpm test` passes, lint and typecheck pass, output conforms to standard React Flow shapes.

**§6.4 mutation table (minimum):** (1) remove initialWidth seeding → test fails.

## Final (the TAG gate — the ONLY way this wave reaches DONE):
Exactly as other waves: STOP and report — no CL.md edits, no PR, no push. Report files changed, verbatim gate outputs with pass/skip counts, the mutation table, what you did NOT verify, anything you STOPped on.
