# Batch {NNN} — {Lane}.Wave {W} — `{slug}`

> **FRESH SESSION REQUIRED.** Run this wave in a **new chat / new agent with no prior context**. This file
> is fully self-contained — it is the only instruction you need. Do **not** carry state from a previous wave.
> One wave = one new session = one branch = one commit = one TAG audit.
>
> **Engine class:** Flash (Gemini Flash 3.7 High in Antigravity, turbo mode). Every step below is sized for a
> small-context agent: one concern, explicit file paths, no open design decisions. If a step forces a
> design choice that is not written here, **STOP and report** — do not improvise.

1. **One wave = one branch = one commit.** Branch `cu-b{NNN}-{lane}-w{W}-{slug}` off current `main`. Squash everything into one commit.
2. **Verify before you act.** Every file, symbol, and dependency this brief cites: open it and confirm it exists as described BEFORE writing code. A citation that does not match reality = STOP and report; do not "fix" the mismatch.
3. **Modify only the files listed in `Files:`.** No new modules, dependencies, or abstractions unless this wave explicitly says so. If you think you need one, STOP and report.
4. **Minimal diff.** No drive-by refactors, no reformatting untouched lines, no comment sweeps.
5. **Acceptance gate (all must pass before you commit):** `pnpm lint` clean · `pnpm typecheck` clean (zero errors — the repo baseline is zero; there is no delta allowance) · the named acceptance test passes · `pnpm test` shows no new failures vs `main`.
6. **Licence firewall (voids the wave if broken):** never open, quote, or port from `C:\Claude\EasySchematic\**` or the three AGPL-derived steps-ai files named in `docs/decisions/0005-romtegning-reuse-and-licence-lists.md` §FORBIDDEN (these paths appear here solely as a do-not-open prohibition). If this brief's task seems to need them, STOP and report. Any dependency you are told to add must satisfy the CONTRIBUTING §2 allowlist (or a recorded exception in `scripts/licence-exceptions.json`) — check its licence field before installing.
7. **NCE is the store.** No new client-side persistence (no localStorage/IndexedDB/file saves) for design data. Ephemeral UI state lives in the zustand store only.
8. **Secrets:** never commit tokens, DSNs, or `.env` values. Test config goes through the documented seams.
9. **Turbo-mode discipline:** you may auto-run read/build/test commands (`pnpm …`, `git status/diff/log`, file reads). You must NOT run `git push`, `gh …`, `git merge`, `git rebase`, anything that deletes outside the repo, or any network mutation. Commit on your branch is the last state-changing command of your run.
10. **Craft gate:** functions small and single-purpose; names in English; no `any` without an inline justification; comments state constraints the code can't show, not narration.
11. **Report format** — end your run with exactly: files changed · the **verbatim** gate output for lint, typecheck, your acceptance test and the full test run, each with its **pass/skip counts** (an exit code of 0 alongside "N skipped" is NOT a pass) · every file you touched outside `Files:` and why it was forced · your §6.4 mutation table (below) · what you did NOT verify, named explicitly · anything you STOPped on.

**Skills:** {primary} (primary), {supporting…}
**Depends on:** {deps — prior waves / external blockers}
**Reads (context, do not edit):** {docs / source files to read first}
**Files (exactly these — nothing else):** {file list with per-entry justification where non-obvious}
**Goal:** {one tight paragraph: the single capability this wave adds and the contract it honors}

**Steps:**
1. {atomic step}
2. {atomic step}
…

**Acceptance:** {exact test file + the assertions that prove the done-when}. `pnpm lint && pnpm typecheck && pnpm vitest run {path}` clean.

**§6.4 — green is not evidence, RED is. Your report is rejected without this.** For each guard/behavior you claim, break it in a **scratch copy** (never the working tree), record which test went RED, restore byte-identically, and put the table in your report. Also hijack each new test in turn (`expect(true).toBe(false)` at its top) and confirm only that one fails. If you did not prove a claim, do not make it — write "not verified" instead.

## Final (the TAG gate — this is the ONLY way this wave reaches DONE):

1. When all steps + the acceptance gate are green: **STOP and report.** That is the end of your job.
2. **Do NOT edit `orchestration/CL.md`.** Ledger state is orchestrator-only.
3. **Do NOT open a PR and do NOT push** unless the orchestrator asks. Commit on your wave branch and stop there.
4. **The independent adversarial audit is still the gate** — the orchestrator dispatches it against your commit, adjudicates the verdict, and flips the ledger itself. Your commit being green is *necessary*, never *sufficient*.
5. If the acceptance gate fails and you cannot fix it within this wave's stated scope, **STOP and report** — do not widen scope, do not "fix" a mismatch, do not start the next wave. A STOP is a successful outcome.

**§6.3 — name what you verified and how; name what you did NOT verify and why. Never say "complete", "all", or "every" about something you sampled.** An omission that is named is a scope decision; an omission that is silent is a defect.

