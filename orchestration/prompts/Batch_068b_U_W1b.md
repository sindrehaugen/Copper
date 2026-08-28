# Batch 068b — U.Wave 1b — `app-shell`

> **FRESH SESSION REQUIRED.** Run this wave in a **new chat / new agent with no prior context**. This file
> is fully self-contained — it is the only instruction you need. One wave = one new session = one branch =
> one commit = one TAG audit.
>
> **Engine class:** Flash (Gemini Flash 3.7 High in Antigravity, turbo). If a step forces a design choice
> that is not written here, **STOP and report** — do not improvise.

Branch: `cu-b068b-u-w1b-app-shell`.

**Skills:** react-best-practices
**Depends on:** B68
**Reads (context, do not edit):** `docs/decisions/0002-frontend-stack.md`
**Files (exactly these — nothing else):** `app/package.json` (modified), `app/src/shell/**` (new), `app/src/main.tsx` (modified), `app/src/locales/**` (new), `app/src/shell/index.test.tsx` (new)
**Goal:** Navigation + module-surface registry (router: react-router), session/tenancy context, **i18n scaffold (i18next; nb-NO/en, all copy externalized)**.

**Steps:**
1. Install `react-router` and `i18next` / `react-i18next` in `app/`.
2. Scaffold `app/src/shell/` with router setup and a placeholder layout (just a nav bar and main content area).
3. Setup `i18next` with `nb-NO` and `en` namespaces in `app/src/locales/`. Provide at least one key (e.g., "nav.home") in both languages and use it in the layout.
4. Export the router from `app/src/shell/` and render it in `app/src/main.tsx`.
5. Run the full gate locally; commit.

**Acceptance:** `pnpm test` passes, lint and typecheck pass, app renders without crashing (verified via a simple vitest render test for the shell).

**§6.4 mutation table (minimum):** (1) break the i18n translation key to ensure the test catches it.

## Final (the TAG gate — the ONLY way this wave reaches DONE):
Exactly as other waves: STOP and report — no CL.md edits, no PR, no push. Report files changed, verbatim gate outputs with pass/skip counts, the mutation table, what you did NOT verify, anything you STOPped on.
