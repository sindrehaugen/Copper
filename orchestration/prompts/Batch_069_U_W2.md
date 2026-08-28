# Batch 069 - U.Wave 2 - `a11y-ratchets`

> **FRESH SESSION REQUIRED.** Fully self-contained brief; one wave = one session = one branch = one commit = one TAG.
> **Engine class:** Flash (Gemini Flash 3.7 High, turbo). Unwritten design decision -> STOP and report.

Rules 1-11: as in `orchestration/_TEMPLATE.md`, verbatim. Branch: `cu-b069-u-w2-a11y-ratchets`.

**Skills:** web-accessibility, vitest
**Depends on:** B68b
**Reads (context, do not edit):** `app/src/shell/layout.tsx`
**Files (exactly these):** `app/package.json`, `pnpm-lock.yaml`, `orchestration/_TEMPLATE.md`, `app/src/shell/a11y.test.tsx` (new), `eslint.config.js` (or existing eslint config)
**Goal:** Introduce strict a11y ratchets: eslint-plugin-jsx-a11y + Axe smoke test against the shell layout. Add the EN 301 549/WCAG 2.1 AA acceptance requirement into the master template. We will defer full Playwright axe smoke to B78, so use `vitest` + `jsdom` + `@axe-core/react` (or `axe-core`) here for the unit test.

**Steps:**
1. Install `eslint-plugin-jsx-a11y` and configure it in the `app/` ESLint setup to error on violations.
2. Install `axe-core` and `@axe-core/react` (if useful) or `vitest-axe` as devDependencies.
3. Write `app/src/shell/a11y.test.tsx` which renders `layout.tsx` (mocking contexts if needed) and runs `axe` to ensure zero violations.
4. Edit `orchestration/_TEMPLATE.md` rule 5 (Acceptance Gate) to explicitly include: "Must pass WCAG 2.1 AA / EN 301 549 criteria via automated axe checks and keyboard operability."
5. Gate; commit.

**Acceptance:** ESLint throws on a11y violations (verify via scratch edit), axe test passes.

**§6.4 mutation table:** (1) remove an `aria-label` or add an inaccessible image to `layout.tsx`, fail the axe test.

## Final: as `orchestration/_TEMPLATE.md` §Final.