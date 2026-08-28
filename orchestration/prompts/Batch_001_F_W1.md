# Batch 001 — F.Wave 1 — `app-scaffold`

> **FRESH SESSION REQUIRED.** Run this wave in a **new chat / new agent with no prior context**. This file
> is fully self-contained — it is the only instruction you need. One wave = one new session = one branch =
> one commit = one TAG audit.
>
> **Engine class:** Flash (Gemini Flash 3.7 High in Antigravity, turbo). If a step forces a design choice
> that is not written here, **STOP and report** — do not improvise.

Rules 1–11: as in `orchestration/_TEMPLATE.md` — read them there first; they apply verbatim. Branch: `cu-b001-f-w1-app-scaffold`.

**Skills:** typescript-pro (primary), react-best-practices, vite
**Depends on:** — (first wave)
**Reads (context, do not edit):** `docs/decisions/0002-frontend-stack.md` · `CONTRIBUTING.md` §2, §4
**Files (exactly these — nothing else):** `package.json` (new), `pnpm-workspace.yaml` (new), `pnpm-lock.yaml` (generated), `app/**` (new), `tsconfig.json`, `tsconfig.node.json`, `eslint.config.js`, `vitest.config.ts`, `.github/workflows/ci.yml` (new), `.gitignore` (new)
**Goal:** an empty but fully gated React app: pnpm workspace with one package (`app`), Vite + React 19 + TypeScript `strict: true`, eslint flat config, vitest — and a CI workflow running lint, typecheck, and tests on push/PR. No UI beyond a "Copper" placeholder. No extra dependencies beyond what this brief names.

**Steps:**
1. `pnpm init` at repo root; author `pnpm-workspace.yaml` with `packages: ["app", "bff", "catalog", "rig"]` (only `app` exists yet — that is fine).
2. Scaffold `app/` with Vite (react-ts template), React 19, TypeScript strict (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` all true). Dependencies allowed: `react`, `react-dom`, `zod`. Dev: `vite`, `@vitejs/plugin-react`, `typescript`, `vitest`, `eslint` + `typescript-eslint`, `@types/react`, `@types/react-dom`. **No other packages** — `@xyflow/react`, `elkjs`, `zustand` arrive in their own waves.
3. Create the folder skeleton `app/src/{model,layout,editor,views,exchange,store}/` each with an `index.ts` exporting nothing (`export {}`) and `app/src/model/index.test.ts` with one trivial vitest test.
4. Root scripts in `package.json`: `lint` (eslint), `typecheck` (`tsc -b`), `test` (`vitest run`), `dev` (vite in app).
5. Author `.github/workflows/ci.yml`: single job on `push` + `pull_request` — checkout (SHA-pinned like `deploy-pages.yml` does), pnpm setup, `pnpm install --frozen-lockfile`, then `pnpm lint && pnpm typecheck && pnpm test`.
6. `.gitignore`: `node_modules/`, `dist/`, `coverage/`, `.vite/`.
7. Run the full gate locally; commit.

**Acceptance:** `pnpm lint && pnpm typecheck && pnpm vitest run` all green with verbatim summaries in your report; `app/src/model/index.test.ts` passes; `git status` clean after commit.

**§6.4 mutation table (minimum):** (1) introduce a type error in a scratch copy → `typecheck` RED; (2) break the trivial test → `vitest` RED, and only that test. Restore byte-identically.

## Final (the TAG gate — the ONLY way this wave reaches DONE):
Exactly as `orchestration/_TEMPLATE.md` §Final: STOP and report — no CL.md edits, no PR, no push. Report files changed, verbatim gate outputs with pass/skip counts, the mutation table, what you did NOT verify (e.g. "CI workflow not executed — no push rights; verified by syntax and local command parity"), anything you STOPped on.
