# Batch 002 — F.Wave 2 — `licence-gate`

> **FRESH SESSION REQUIRED.** Fully self-contained brief; one wave = one session = one branch = one commit = one TAG.
> **Engine class:** Flash (Gemini Flash 3.7 High, turbo). Unwritten design decision → STOP and report.

Rules 1–11: as in `orchestration/_TEMPLATE.md`, verbatim. Branch: `cu-b002-f-w2-licence-gate`.

**Skills:** nodejs-best-practices (primary), security-audit
**Depends on:** B1
**Reads (context, do not edit):** `CONTRIBUTING.md` §1–2 · `docs/decisions/0005-romtegning-reuse-and-licence-lists.md`
**Files (exactly these):** `scripts/check-licences.mjs` (new), `scripts/forbidden-sources.mjs` (new), `scripts/*.test.mjs` (new, run by vitest), `.github/workflows/ci.yml` (**chokepoint — one surgical edit**: add one step invoking both scripts), `package.json` (two script entries only)
**Goal:** three CI ratchets. (a) Licence gate: walk `node_modules` (or lockfile metadata) and fail on any package whose licence is not in the allowlist `MIT, ISC, BSD-2-Clause, BSD-3-Clause, Apache-2.0, CC0-1.0, 0BSD, Unlicense, Python-2.0`; unknown/missing licence = fail. Exceptions require an entry in `scripts/licence-exceptions.json` citing a `docs/decisions/` file — ship it with exactly one entry: `{"name": "elkjs", "licence": "EPL-2.0", "decision": "docs/decisions/0010-elkjs-epl-licence-exception.md"}` (see that ADR). (b) Forbidden-source scan over **code trees only** — `app/`, `bff/`, `catalog/`, `rig/`, `scripts/` in `git ls-files` — for the marker strings `EasySchematic`, `easyschematic` (exempt inside `app/src/exchange/easyschematic/` and `app/tests/fixtures/`, which legitimately name the *format*), `banesok`, `rutekvalitet`, `connectorAccepts`, `stygghetstall`; fail with file:line on any hit. **`docs/`, `orchestration/`, `README.md`, `CONTRIBUTING.md` are out of scope by design — the ban is on ported code, and those documents define the ban.** (c) Dependency + CDN hygiene: run `pnpm audit --prod --audit-level=high` (fail on findings) and grep `app/` + `bff/` for external `<script src=`/`<link href=` to non-relative origins (fail on any — ADR-0008 §1).

**Steps:**
1. Write `check-licences.mjs` (no new dependencies — read `node_modules/*/package.json` directly; handle scoped packages and SPDX expressions like `(MIT OR Apache-2.0)` by accepting if ANY branch is allowlisted; exceptions file consulted last).
2. Write `forbidden-sources.mjs` using `git ls-files` filtered to the five code trees + streaming reads; the two exempt path prefixes exempt the *format name* strings only, never `banesok`/`rutekvalitet`/`connectorAccepts`/`stygghetstall`.
3. Write the audit+CDN step (a script or two CI lines — your call, smallest diff wins).
4. Tests: fixture a fake package dir with a GPL licence → RED; the elkjs exception fixture → GREEN; fixture a temp file under a fake `app/` tree containing `banesok` → RED; clean tree → GREEN. Use temp dirs, never the real tree.
5. Add the CI steps; add `pnpm licences` and `pnpm forbidden` scripts; run full gate; commit.

**Acceptance:** both scripts exit 0 on the clean tree (with the code-tree scoping and the elkjs exception applied); all RED cases proven in tests; `pnpm lint && pnpm typecheck && pnpm test` green.

**§6.4 mutation table (minimum):** (1) drop `GPL-3.0` fixture → licence test RED; (2) plant `rutekvalitet` in a temp-tracked fixture → scan test RED; (3) remove the allowlist check line in a scratch copy → clean-tree test still green BUT the GPL fixture test goes GREEN (proving the fixture test is the real gate).

## Final: as `orchestration/_TEMPLATE.md` §Final — STOP and report with the full report format.
