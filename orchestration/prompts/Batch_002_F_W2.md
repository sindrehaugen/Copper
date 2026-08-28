# Batch 002 — F.Wave 2 — `licence-gate`

> **FRESH SESSION REQUIRED.** Fully self-contained brief; one wave = one session = one branch = one commit = one TAG.
> **Engine class:** Flash (Gemini Flash 3.7 High, turbo). Unwritten design decision → STOP and report.

Rules 1–11: as in `orchestration/_TEMPLATE.md`, verbatim. Branch: `cu-b002-f-w2-licence-gate`.

**Skills:** nodejs-best-practices (primary), security-audit
**Depends on:** B1
**Reads (context, do not edit):** `CONTRIBUTING.md` §1–2 · `docs/decisions/0005-romtegning-reuse-and-licence-lists.md`
**Files (exactly these):** `scripts/check-licences.mjs` (new), `scripts/forbidden-sources.mjs` (new), `scripts/*.test.mjs` (new, run by vitest), `.github/workflows/ci.yml` (**chokepoint — one surgical edit**: add one step invoking both scripts), `package.json` (two script entries only)
**Goal:** two CI ratchets. (a) Licence gate: walk `node_modules` (or lockfile metadata) and fail on any package whose licence is not in the allowlist `MIT, ISC, BSD-2-Clause, BSD-3-Clause, Apache-2.0, CC0-1.0, 0BSD, Unlicense, Python-2.0`; unknown/missing licence = fail. Exceptions require an entry in `scripts/licence-exceptions.json` citing a `docs/decisions/` file — ship the file empty. (b) Forbidden-source scan: grep tracked files for markers of the FORBIDDEN list — the strings `EasySchematic`, `easyschematic` (outside `app/src/exchange/easyschematic/` and `app/tests/fixtures/`, which legitimately name the *format*), `banesok`, `rutekvalitet`, `connectorAccepts`, `stygghetstall` — and fail with file:line on any hit.

**Steps:**
1. Write `check-licences.mjs` (no new dependencies — read `node_modules/*/package.json` directly; handle scoped packages and SPDX expressions like `(MIT OR Apache-2.0)` by accepting if ANY branch is allowlisted).
2. Write `forbidden-sources.mjs` using `git ls-files` + streaming reads; the two allowed path prefixes above are the ONLY exemptions, and they exempt the *format name* strings only, never `banesok`/`rutekvalitet`/`connectorAccepts`/`stygghetstall`.
3. Tests: fixture a fake package dir with a GPL licence → RED; fixture a temp file containing `banesok` → RED; clean tree → GREEN. Use temp dirs, never the real tree.
4. Add the CI step; add `pnpm licences` and `pnpm forbidden` scripts; run full gate; commit.

**Acceptance:** `node scripts/check-licences.mjs` and `node scripts/forbidden-sources.mjs` exit 0 on the clean tree; both proven RED on seeded fixtures in tests; `pnpm lint && pnpm typecheck && pnpm test` green.

**§6.4 mutation table (minimum):** (1) drop `GPL-3.0` fixture → licence test RED; (2) plant `rutekvalitet` in a temp-tracked fixture → scan test RED; (3) remove the allowlist check line in a scratch copy → clean-tree test still green BUT the GPL fixture test goes GREEN (proving the fixture test is the real gate).

## Final: as `orchestration/_TEMPLATE.md` §Final — STOP and report with the full report format.
