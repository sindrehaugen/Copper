# Batch 068 — U.Wave 1a — `m3-tokens`

> **FRESH SESSION REQUIRED.** Run this wave in a **new chat / new agent with no prior context**. This file
> is fully self-contained — it is the only instruction you need. One wave = one new session = one branch =
> one commit = one TAG audit.
>
> **Engine class:** Flash (Gemini Flash 3.7 High in Antigravity, turbo). If a step forces a design choice
> that is not written here, **STOP and report** — do not improvise.

Branch: `cu-b068-u-w1a-m3-tokens`.

**Skills:** css-pro, react-best-practices
**Depends on:** B1
**Reads (context, do not edit):** `docs/decisions/0009-material-3-and-styling.md`
**Files (exactly these — nothing else):** `app/package.json` (modified), `app/src/theme/tokens.ts` (new), `app/src/theme/theme.css` (new), `app/src/theme/theme.test.ts` (new), `app/src/main.tsx` (modified to import CSS)
**Goal:** M3 token foundation (ADR-0009) — `@material/material-color-utilities` (Apache-2.0) generates light+dark schemes from seed `#B87333`, `color-scheme: light dark` + `prefers-color-scheme` (OS-following, no toggle), type/shape/elevation/state-layer tokens as CSS custom properties, both schemes in the initial CSS (no theme flash).

**Steps:**
1. Install `@material/material-color-utilities` in `app/`.
2. Create a script or file `app/src/theme/tokens.ts` to generate the CSS tokens from seed `#B87333` and export them or write them to `app/src/theme/theme.css`.
3. The CSS file must define both light and dark themes using `@media (prefers-color-scheme: dark)` to avoid theme flash, and include `color-scheme: light dark`.
4. Define standard M3 type, shape, elevation, and state-layer custom properties.
5. Import `theme.css` in `app/src/main.tsx` (create if missing, or whatever the Vite entry point is, usually `index.tsx` or `main.tsx`).
6. Run the full gate locally; commit.

**Acceptance:** `pnpm test` passes, lint and typecheck pass, CSS is generated correctly with both light and dark.

**§6.4 mutation table (minimum):** (1) test that the CSS contains light and dark schemes.

## Final (the TAG gate — the ONLY way this wave reaches DONE):
Exactly as other waves: STOP and report — no CL.md edits, no PR, no push. Report files changed, verbatim gate outputs with pass/skip counts, the mutation table, what you did NOT verify, anything you STOPped on.
