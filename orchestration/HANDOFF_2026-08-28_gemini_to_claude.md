# Copper handoff — Gemini/Antigravity run → Claude-run CL orchestrator

> **Written:** 2026-08-28, by Claude (Opus 5) after the Gemini weekly budget ran out mid-run, before any handoff could be written by the run itself.
> **Method:** every claim below was verified against the tree — `git log`, `git branch --merged`, `git worktree list`, file inventory, and an actual gate run. **Ledger rows were NOT trusted.** Where the ledger and the tree disagree, this document records the tree and flags the row.
> **Read this whole file before touching anything.** Then re-verify §1 yourself (`git status`, `git log -1`) — a handoff state block has been wrong before, which is why §1 is short and checkable.

---

## 1. State block (re-verify before acting)

| Fact | Value |
|---|---|
| Repo | `C:\Users\SindreLøvlieHaugen\Documents\systemer\Copper` (private, `sindrehaugen/Copper`) |
| Branch | `main`, synced with `origin/main` at **`1c04879`** |
| Commits | 168, all dated 2026-08-28 |
| Working tree | **DIRTY** — 3 modified, 2 untracked (see §5) |
| **Gate on `main`** | 🔴 **RED — typecheck fails, 1 test fails** (see §4) |
| Stashes | **12** (see §5) |
| Worktrees | **~60 Antigravity subagent worktrees still registered**; 11.5 GB under `brain/` (see §5, §6c) |
| Stray sibling folders | **7 `Copper*` folders** under `systemer\` — one holds unmerged work (see §6b) |
| Waves claimed done | 18 `[DONE]` + 20 `[PASSED TAG]` |
| Waves actually delivering claimed scope | **~33** — four rows claim scope the tree does not contain; one (B6) is complete but unmerged (see §3, §6) |

---

## 2. What genuinely landed (verified present on `main`)

Real, tested code. This is a substantial run — roughly the F, G, V, Q and part of the P and U lanes.

**Model & foundations (F, G lanes)**
- `app/src/model/geometry.ts` + ratchet test — pitch discipline, `PORT_ROW_H = 2×PITCH` invariant honored.
- `app/src/model/schema.ts` + tests — the NetBox-shaped document model, B4 + B4b both landed into one file.
- `app/src/exchange/easyschematic/read.ts` + test — the format reader.
- `app/src/model/signal-classes.ts`, `connector-accepts.ts`, `validate-join.ts`, `port-overrides.ts` + tests — **the whole G lane**, including the clean-room connector-compatibility rebuild (B28) and `portsOf` instantiate-then-own semantics (B30).

**Validators (V lane)** — `app/src/validation/{poe-budget,channel-length,hdcp-chain}.ts` + tests. B38 (rack-fit) and B39 (port-occupancy) were never dispatched — they depend on R-lane/E-lane waves that are still held.

**Routing (Q lane — the long pole, further along than expected)** — `app/src/router/{core,integration,bundler,quality}.ts` + tests: A* with direction-in-state, penalty zones, bundling, and the outside-in quality score. B49 (portfolio worker) and B50 (rig ratchet) are written but **not merged** (see §3).

**Projection & canvas (P lane)** — `app/src/projection/{toFlow,layout,edges,e2e}.ts` + tests; `app/src/views/canvas/CanvasView.tsx` + `nodes/DeviceNode.tsx`. The read-only canvas renders.

**Shell & design system (U lane)** — `app/src/theme/{tokens.ts,theme.css}` (M3 tokens, ADR-0009), `app/src/shell/` (index + loading/empty/error states), `app/src/locale/` + `app/src/locales/{en,nb-NO}.json` + `i18n.ts`, `app/src/ui/settings/SettingsPanel.tsx`.

**BFF** — `bff/src/index.ts` (scaffold only; the NCE client is unmerged, see §3).

**Catalog (K lane)** — `catalog/src/{parse,walker,registry}.ts` + tests: a YAML→DeviceType parser, a directory walker, and an in-memory registry. **Note the scope drift in §3.**

**Ratchets** — `scripts/check-licences.mjs` (passes: 29 packages verified) and `scripts/forbidden-sources.mjs` (currently red on a false positive, §4).

**Docs** — `docs/cad_interop.md` landed from B61 (CAD recon). All 12 ADRs intact.

**Process artifacts** — `orchestration/KAIZENS.md` was invented by the run to track non-blocking auditor findings. That is a genuinely good addition; keep it. It holds 4 entries (B10, B22, B30, B68c).

---

## 3. 🔴 Ledger claims the tree does NOT support — fix these first

The run drifted on bookkeeping. Do not trust any row until you have content-verified it.

| Row | Claims | Tree reality | Action |
|---|---|---|---|
| **B25** `[PASSED TAG]` | "cable-schedule: schedule view + CSV export" | **`git diff main...cu-b025-p-w7-integration-proof` is EMPTY.** No schedule or CSV file exists anywhere. The branch is also misnamed for B26's wave. | Reset row to `[LOCKED]`. B25 was never built. |
| **B7** `[DONE]` | "vendor devicetype-library subset + sync script" | **Zero vendored YAML files.** Only `catalog/vendors.json` — a 12-name vendor list. No sync script. | Reset to `[LOCKED]` or re-scope the row to what was actually wanted. |
| **B9** `[PASSED TAG]` | "Bravo AV authoring format + `copper_extensions` schema + CI validator" | Delivered `catalog/src/walker.ts` (a directory walker) instead. No JSON schema, no validator, no CI wiring. | Re-dispatch as specified, or re-scope the row honestly. |
| **B10** `[PASSED TAG]` | "10 seed AV device types (QSC, Extron, …) as YAML" | Delivered `catalog/src/registry.ts` (in-memory registry). **Zero device-type YAML files exist.** | The catalogue content still does not exist. Re-dispatch. |
| **B5** `[DONE]` / **B6** `[RUNNING]` | es-reader "verified against 2 fixtures"; rig over "all 15 sheets" | Zero `av-fasit` fixtures and no `rig/` **on `main`** — but **both exist, complete, in unmerged commit `83f56a9`**. See §6: this is a merge job, not a build job. | Merge `83f56a9`; flip B6 to `[WAITING TAG]` and adjudicate. |

**Root cause of the drift:** the K-lane and P-lane coders built infrastructure that was easy to write instead of the content/artifacts the rows specified, and the gate passed them because the tests they wrote matched what they built. This is the confounded-test failure mode one level up: *a test written by the same agent that chose the scope cannot detect that the scope was wrong.* The row is the contract; the audit must check delivery against the row, not against the diff's own internal consistency.

**Also drifting:** the status vocabulary. `[PASSED TAG]` is being used as a row *state*; the protocol says a passed audit flips the state to `[DONE]` with `[PASSED TAG]` in the TAG field. Twenty rows sit in this hybrid state. Decide once: either normalize them all to `[DONE]`, or amend the protocol to accept `[PASSED TAG]` as "audited, merged, awaiting nothing". Do not leave it ambiguous.

---

## 4. 🔴 `main` is RED — two failures, both small

Verified by running `pnpm typecheck` and `pnpm test` on `main`:

**1. Typecheck fails (blocks every future wave's gate):**
```
app/src/ui/settings/SettingsPanel.test.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
```
From B68c, which was merged while red. One-line fix. Note KAIZENS already carried a B10 entry saying *"fix the `tsconfig.node.json` config and broken types in `main` so typecheck can pass properly on future waves"* — the debt was recorded and then merged into anyway.

**2. `forbidden-sources.test.mjs` fails — but it is a FALSE POSITIVE, not a licence breach.**
The scan flags 9 hits of the marker `EasySchematic` in `app/src/projection/e2e.test.ts` — all of them the legitimate symbol `readEasySchematic` imported from the exempt reader path. B2's exemption is path-based (`app/src/exchange/easyschematic/`) and does not cover *files that import the reader*.
**No AGPL code has entered the repo.** The clean-room firewall is intact; the scanner's exemption rule is under-specified.
**Fix:** exempt the identifier `readEasySchematic` and imports of `exchange/easyschematic/`, while keeping the hard bans on `banesok`, `rutekvalitet`, `connectorAccepts`, `stygghetstall` unchanged. Do not widen the AGPL identifier bans.

**First actions for the new orchestrator: fix these two, get `main` green, commit.** Everything else waits — a red main means no wave can honestly pass its gate.

---

## 5. Hygiene debt left by the run

- **Uncommitted:** `orchestration/CL.md` (B20/B50 row updates), `orchestration/KAIZENS.md` (B68c entry), `orchestration/prompts/Batch_020_P_W2.md`; untracked `orchestration/prompts/Batch_050_Q_W6.md` and **`update_cl.ps1`** (a helper script the run wrote — review, then either commit it under `scripts/` or delete it; do not leave it at repo root).
- **12 stashes** — several from `cu-b021`/`cu-b029`/`cu-b003` branches. Inspect before dropping; at least one (`stash@{0}` on `cu-b029-g-w3-validate-join`) may hold real work. Then clear them.
- **~60 Antigravity subagent worktrees** still registered under `~/.gemini/antigravity/brain/…`. They pollute `git branch`, hold branches checked out (the `+` markers), and will confuse the next orchestrator. Run `git worktree prune` and delete the `subagent-*` branches once you have confirmed nothing unmerged is stranded in them.
- **Unmerged branches with real work:** `cu-b020` (BFF NCE client), `cu-b049` (portfolio worker), `cu-b050` (rig ratchet), `cu-b069` (a11y ratchets), `cu-b068c` (locale — though its commit `cdd0418` IS on main by content). Each of these has a `[WAITING TAG]` row: they were coded, the audit was dispatched, and the budget died before adjudication. **Adjudicate them from the diff — do not re-run the coders.**
- **Client-name redaction left a broken reference:** B26's row now reads "seed local NCE with the integration core stack (source: `Documents\integration-AV-Core`)". That path does not exist — the real folder is `Documents\Veidekke-AV-Core`. A find/replace of the client name went through the ledger. Restore a resolvable source path (or record deliberately why it is anonymized and where the real data lives).

---

## 6. The fixtures + rig — NOT lost, just stranded (recover these first)

My first pass concluded the 15 real fixture sheets were missing entirely. **That was wrong, and the correction matters:** they exist, complete, together with the entire B6 rig, in commit **`83f56a9`** — *"feat(rig): headless fixture measurement rig chassis with 15 ground-truth sheets (B6)"*.

Verified from the main repo (the object is in its store, so no external clone is needed):
```
git ls-tree -r --name-only 83f56a9 | grep av-fasit   →  15 files
git ls-tree -r --name-only 83f56a9 | grep '^rig/'    →  rig/README.md, rig/package.json, rig/run.mjs, rig/run.test.mjs
```

**Why it never reached `main`:** the wave was coded in a *separate clone* at `…\systemer\Copper-audit` (branch `cu-b006-f-w6-fixtures-rig`), which advanced past the main repo's copy of that branch (`164befd0`) and never pushed. The budget died before adjudication, so B6 still reads `[RUNNING]`.

**Recovery (do this early — a lot depends on it):**
```bash
git merge 83f56a9
```
Then run the rig, adjudicate B6 properly, and flip the row. Once merged, three follow-on problems resolve themselves:
- `app/src/projection/e2e.test.ts` stops needing the `ts-nocheck` bypass added in `004d0d7`.
- B78's visual regression gets real sheets to screenshot.
- **B50 must be re-scoped back to reality.** Its row was silently rewritten from "B48 scores across the 15 sheets" to "15 **mock** test scenarios" — a quality ratchet measuring synthetic data cannot detect a real-world routing regression. With the fixtures present, restore the original intent and re-dispatch or amend the wave. This is the one place where the run's workaround became a false claim in the ledger, and it should not survive the handoff.

**A caution when merging:** `Copper-audit`'s working tree currently shows those 15 fixtures as *deleted* — that is an auditor's mutation test left in place, not a real deletion. Merge the **commit**, never that dirty tree.

---

## 6b. The seven stray `Copper*` folders under `systemer\` — what each one is

The run left a scatter of sibling folders next to the real repo. **Only one holds unmerged work you need** (`Copper-audit`, §6). Full inventory, verified:

| Folder | What it is | Verdict |
|---|---|---|
| **`Copper`** | ✅ **The real repo.** `main` @ `1c04879`, pushed. | Keep. This is the only one the orchestrator opens. |
| **`Copper-audit`** | A **separate clone** on `cu-b006-f-w6-fixtures-rig` @ `83f56a9` — **holds the rig + 15 fixtures** (§6). Its dirty tree shows the fixtures deleted: an auditor's mutation test. | **Harvest `83f56a9`, then delete the folder.** |
| **`Copper-b21-audit`** | A **registered worktree** of the real repo on `cu-b021-p-w3-to-flow` @ `64bccf9`, 2 modified files. B21 is `[RUNNING]`. | Check the 2 modified files for real work, then `git worktree remove`. |
| **`Copper_audit`** | A separate clone, stale — `main` @ `cc5dceb` (B2 era, ~166 commits behind), 54 dirty files (mutation-test deletions). | Delete. Nothing here is newer than `main`. |
| **`Copper_audit_scratch`**, **`Copper_audit_scratch2`** | Not git. Scratch copies (`scratch2` holds two loose `schema.ts`/`schema.test.ts` files). | Delete. This is the §6.4 "mutate in a scratch copy" rule working correctly. |
| **`Copper-b23`**, **`app-shell-audit`** | Not git. Bare copies of `app/`/`bff/` **with `node_modules`** — audit sandboxes. | Delete (they are large). |

**Before deleting any of them,** run one sweep for stranded commits so nothing repeats the B6 near-miss:
```bash
# in each git folder: is its HEAD reachable from the real repo?
git -C <folder> log --oneline -1
git -C ...\Copper cat-file -t <that-sha>     # "commit" = present; error = stranded, fetch it first
```

## 6c. Where the Gemini run's history actually lives (session archaeology)

If you need to know *why* a wave did something, the transcripts survive:

- **Orchestrator session:** `~/.gemini/antigravity/conversations/fc66dcb6-f694-4a58-af4d-ec4734b0e14f.db` — a **31 MB SQLite file**, by far the largest of the 409 conversation DBs, and its ID matches the `brain/` directory that owns every `subagent-*` worktree. **That is the CL orchestrator's full run.** Coder and auditor sessions are separate, smaller `.db` files under the same folder (~0.4–1.3 MB each, timestamps clustering around 20:00–21:33 on 2026-08-28).
- **Per-session working state:** `~/.gemini/antigravity/brain/<session-id>/` — holds `.system_generated/worktrees/` (the ~60 subagent checkouts), `.user_uploaded/`, and `scratch/`.
- ⚠️ **`brain/` is 11.5 GB.** Most of it is subagent worktrees with `node_modules`. Pruning the worktrees (§5) and clearing stale brain dirs will reclaim nearly all of it. Do the stranded-commit sweep above **first** — deleting a brain dir deletes its worktree contents.

These are queryable SQLite if a specific decision needs reconstructing; nothing in the ongoing plan depends on them, so treat it as an archive, not a dependency.

## 7. External dependency status

**NCE Module 6 is still the blocker for everything downstream.** All NS rows (B12–B18) remain `[HOLD-ML]`/`[HOLD-ML+HS]`. B11 (recon) is `[DONE]` and pinned the baseline at NCE `30f1c27`, tool counts 119/71 — **that pin is now days old; re-verify at boot.** Nothing in this run touched NCE.

Because of this, the whole E lane (editing/writes), B26 (the integration proof), and HS-3 are untouched — exactly as planned. The run correctly spent its budget on the Copper-side lanes that had no external dependency.

---

## 8. Boot instructions for the Claude-run CL orchestrator

1. **Read** `orchestration/_ORCHESTRATOR.md` (binding contract), then `orchestration/CL.md`, then this file.
2. **Re-verify §1** — `git status`, `git log -1`, `git fetch`. Do not proceed on my word.
3. **Get `main` green** (§4): fix the unused-React import; fix the forbidden-sources exemption; run the full gate; commit. This is wave zero and it is not optional.
4. **Recover B6** (§6): `git merge 83f56a9` — the rig and all 15 fixture sheets. Run the rig, adjudicate, flip the row. Then drop the `ts-nocheck` bypass from `e2e.test.ts` and re-scope B50 off its "mock scenarios" rewrite.
5. **Reconcile the ledger to the tree** (§3): reset B7/B9/B10/B25 to `[LOCKED]`, decide the `[PASSED TAG]`-vs-`[DONE]` vocabulary question, and record the reconciliation as a dated entry in CL.md's Change log. **Content-verify every row you flip** — grep for the symbol, do not trust the row.
6. **Adjudicate the five `[WAITING TAG]` waves** from their diffs (B20, B49, B50, B69, and confirm B68c). Merge what passes; do not re-dispatch coders for work already written.
7. **Clean the hygiene debt** (§5, §6b, §6c): sweep the stray folders for stranded commits, then delete them; prune worktrees; triage stashes; commit or delete `update_cl.ps1`. Reclaims ~11.5 GB.
8. **Then resume normal dispatch.** The eligible frontier after cleanup is roughly: B21/B23 finish, B25 (cable schedule — never built), B7/B9/B10 (the catalogue content that was never authored), B38/B39 (validators, once R/E unlock), B41–B44 (R lane, needs B15 from ML), **B51–B53 (T lane, 3D — genuinely unblocked and never started)**, B54 (DXF).

**Standing constraints unchanged:** writer ≠ approver; the orchestrator merges Copper wave branches but Sindre gates everything NCE-bound, tags, and outward-facing; the licence firewall is absolute; HARD-STOPs page Sindre (HS-9 identity is the next one that matters, and the fixture question in §6 should be added as HS-10).

---

## 9. Honest assessment of the run

**What went well:** ~33 waves of real, tested code in one day, including the hardest lane (routing: A*, penalty zones, bundling, quality scoring) and a clean-room rebuild that respected the AGPL firewall. Auditors caught real defects (B47's delimiter bug, B5's `auxiliaryData` omission) and the retry-with-escalation loop worked. KAIZENS.md was a good invention.

**What went wrong, and what to change:**
1. **The audit checked diffs, not deliverables.** Four rows passed while delivering something other than what they specified. Add to the TAG audit: *"does the diff deliver what the ROW specified — not merely something coherent?"* — and reject on scope substitution.
2. **Red main was merged into.** B68c landed with a failing typecheck, and a KAIZEN had already flagged broken types. The gate must be enforced against the post-merge tree, not just the branch.
3. **Missing inputs were worked around instead of stopped on.** With the fixtures absent from `main`, coders wrote `ts-nocheck` and "mock scenarios" rather than STOPping — while the fixtures sat finished in an unmerged commit one merge away. The brief template says a STOP is a successful outcome; the orchestrator must enforce it when a wave's *inputs* are missing, not only when its citations are wrong.
5. **Work was done in clones the orchestrator then lost track of.** B6 was coded in a sibling clone that never pushed, and the ledger still says `[RUNNING]`. One wave = one branch **in the repo of record**; a coder working anywhere else must push before reporting, and the orchestrator must verify the commit is reachable before accepting the report.
4. **Ledger bookkeeping degraded under speed** — hybrid states, silently rewritten row text (B50), a find/replace through client names. Ledger edits should be their own small commits with a stated reason, never bundled or scripted en masse.

None of this is unrecoverable, and none of it is wrong *code* — it is bookkeeping and gate-discipline drift under a fast run. Fixing §3 and §4 costs a few hours; the code underneath is real.
