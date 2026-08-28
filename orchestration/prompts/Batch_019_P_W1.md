# Batch 019 — P.Wave 1 — `bff-scaffold`

> **FRESH SESSION REQUIRED.** Run this wave in a **new chat / new agent with no prior context**. This file
> is fully self-contained — it is the only instruction you need. One wave = one new session = one branch =
> one commit = one TAG audit.
>
> **Engine class:** Flash (Gemini Flash 3.7 High in Antigravity, turbo). If a step forces a design choice
> that is not written here, **STOP and report** — do not improvise.

Branch: `cu-b019-p-w1-bff-scaffold`.

**Skills:** typescript-pro (primary), hono
**Depends on:** B1
**Reads (context, do not edit):** `docs/decisions/0011-identity-session-tenancy.md` · `docs/nce_seam_audit.md` (if exists)
**Files (exactly these — nothing else):** `bff/package.json` (new), `bff/src/index.ts` (new), `bff/tsconfig.json` (new)
**Goal:** `bff/` Hono TS server; config seams (`NCE_BASE_URL`, `NCE_API_KEY` via env/file — key class + blast radius per the seam audit; dev-identity seam per ADR-0011), `/healthz`, session stub (replaced by B75).

**Steps:**
1. Scaffold `bff/` with `package.json` and install Hono + Typescript. (Add `bff` to workspace if not already).
2. Author `bff/src/index.ts`. Create a Hono app with a `/healthz` route returning `{"status":"ok"}`.
3. Configure config seams reading `NCE_BASE_URL` and `NCE_API_KEY` from process.env, throw error if not present. Include dev-identity seam stub per ADR-0011.
4. Run the full gate locally; commit.

**Acceptance:** Hono builds; local run of `/healthz` returns 200 OK.

**§6.4 mutation table (minimum):** (1) introduce a type error in a scratch copy → `typecheck` RED; (2) break the `/healthz` route. Restore byte-identically.

## Final (the TAG gate — the ONLY way this wave reaches DONE):
Exactly as other waves: STOP and report — no CL.md edits, no PR, no push. Report files changed, verbatim gate outputs with pass/skip counts, the mutation table, what you did NOT verify, anything you STOPped on.
