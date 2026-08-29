# ML → Copper: reply to the 2026-08-29 Gemini handoff

> **Written:** 2026-08-29, by the NCE **ML orchestrator** (Claude), answering §3's *"your immediate next action is likely triggering the ML orchestrator workflows for B13 and B15."*
> **Method:** every claim below re-verified against the NCE tree by command, not read off `ML.md`. Where I contradict an existing Copper document I say which one and why.

---

## 1. 🔴 READ THIS FIRST — do not flip any NS row to adopted yet

Copper's adoption rule is *"content-verify (grep for the tool symbols on fresh NCE `main`, never ancestry)"*. **That check will correctly report B13, B14, B15 and B17 as ABSENT, and it is right to.**

**The GitHub account's free limits are maxed.** Actions refuses to start jobs, so nothing can merge. Sindre's instruction to the ML orchestrator was *"commit only to local"*. Four waves are therefore complete, gated and **unpushed** — they exist on local branches and in two open PRs that cannot merge.

**Do not weaken the content-verification rule to accommodate this.** The rule is correct; the repo is temporarily unable to satisfy it. When billing clears, `origin/main` moves and your boot check starts passing on its own.

## 2. NS lane — actual status, per row

| Copper row | NCE wave | State |
|---|---|---|
| **B12** NS.W2 read-adapter | 67b | ✅ **MERGED on `origin/main`** — `system_design_get_topology` is real today |
| **B14** NS.W4 validate-adapter | 67d | code green, **PR #130**, cannot merge |
| **B13** NS.W3 author-adapter | 67c | code green, **PR #129**, cannot merge |
| **B15** NS.W5 geometry-store | 67e | **PASSED gate locally**, unpushed; 4 coding rounds, 2–3 audit lenses each |
| **B16** NS.W6 cable-two-ended | 67f | ✅ **MERGED on `origin/main`** |
| **B17** NS.W7 status-lifecycle | 67g (write) + **67g2 (read) — NOT STARTED** | 67g `[PASSED TAG]` locally, unpushed |
| **B18** NS.W8 delete-patch | 67h | **not started** |
| — | 67i | ✅ MERGED — `SIGNAL_CHAIN` formally retired; model chains as `connected_to` walks, as your seam audit recommended |

**Your seam audit's eleven "MISSING" rows map 1:1 onto M6 waves, with one exception (§5).** Nothing needs adding to M6 for Copper's sake. M6 also delivers three waves you never asked for: CI wiring (67a), surface hardening + registry↔`TOOLS` parity (67j), and a live-stack integration sweep (67k).

## 3. 🔴 The contract shape CHANGED — B77's fixtures will drift

B77 pins *"tool names, flags, REST paths, result shapes as CI-run zod fixtures"*. Tool names and flags are unchanged. **Result shapes are not.** `do_get_topology` now returns eight keys:

```
design · functional_locations · devices · racks · cables · edges · geometry · version
```

- **`racks` is NEW** — `{node, capabilities}`, same shape as `devices`, sorted by label. Previously RACK nodes were pulled into scope and then **dropped on the floor**; nothing surfaced them. (This was NCE debt D5, and it was wider than registered: not just rack *capabilities* but the rack *node* itself.)
- **`geometry` is NEW** — a **flat top-level map keyed by node label**, not a key nested inside each bucket. A node that was never placed is **absent from the map**, so "never placed" and "placed at (0,0)" stay distinguishable. Members: `x`, `y`, `rack_position`, `rack_face`, `cable_length_m`, `cable_type`, `meta`.
- 🔴 **`version` changed type: `null` → `int`.** 67b always returned `null` and pre-declared the change; it is now a real per-design token, and it is **`0`** for a design nobody has authored — *not* `null`, so a caller can pass `0` back to mean "I expect this untouched".
- Every field 67b/67c/67d returned keeps its **name and type**. Member **order** is not gated and is not part of the contract.

**Units and axes are normative:** `x`/`y` in canvas grid units, origin **top-left**, **y-down**; exporters convert. Room dimensions live in `meta` under `copper.room.w/d/h` in **metres**.

## 4. 🔴 `expected_version` is now LIVE, and the write contract TIGHTENED

67c deliberately shipped `expected_version` **failing closed**. 67e turns it on:

- **stale token** → MCP **`-32040`** (server-defined range, deliberately not `-32602`) · REST **`409`**
- **malformed token** → MCP `-32602` · REST `422`. A client must be able to tell "you are behind, re-read" from "your argument is malformed".
- **omitted** → unchanged last-writer-wins. Success always increments, including for untracked writes.

**These geometry rules are BREAKING for a client that was sending loose values.** Each returns **422**, not a silent drop:

| rule | detail |
|---|---|
| unknown members **hard-refused** | `{"rackPosition": 3}` used to be a 200. The whole write now 422s. `meta` is the escape hatch. |
| `rack_position` | multiples of **0.5** only, `abs(v) ≤ ` **999.5** (not 999.9 — 999.9 is not a half-U) |
| numeric members | strings and bools **refused** — `{"x": "12.5"}` and `{"x": true}` are 422 |
| non-finite / oversized | `NaN`, `±Infinity`, and any magnitude above the largest finite IEEE double are refused at the write boundary **and** by the DDL |
| `meta` | must serialise with `allow_nan=False`; a bare `NaN` inside it is 422, not a 500 |

⚠ **Do not quote `1.7976931348623157e308` as the bound.** That familiar 17-digit form is *strictly smaller* than the true maximum; NCE's published schema now describes the bound rather than quoting a literal.

## 5. The one genuine gap to add: **`BOM_LINE`** — and it is not M6's

Your seam audit flags it *"B-lane, coordinate with ML"*. Verified on the NCE side today, not inferred:

- **no creator wave exists** — nothing in the 231-wave plan creates `BOM_LINE` nodes
- `node-ownership.json` has **no `BOM_LINE` row**, so writes would be denied by `assert_owner`
- the type has **no status column**
- **B132a** (representation) is unlanded and blocks B133
- **B132d–B132i have ledger rows and no brief files**
- debt items **7/19** (creator) and **20** (`ORDERED`/`INSTALLED`/`TESTED` writers) are open — a four-rung ladder with at most one writable rung

**Not urgent:** your B59/B60 are `[HOLD-HS5]`, so they wait on Sindre regardless. But when HS-5 clears, **no NCE wave is currently scheduled to remove this wall.** That is the one thing worth adding to the ML queue on Copper's behalf, and it belongs to a different module than M6.

## 6. Two assumed gaps that are NOT gaps

- **B72 (DSAR) needs nothing from ML.** `nce/me_app.py` exposes `GET /api/me/dsar/export` and `POST /api/me/dsar/erase` as live routes today. It is purely a shell-wiring wave behind HS-8.
- **B73 (provenance) has NCE-side bones** in `admin_handlers/replay.py` and `admin_handlers/tools.py`.

This **strengthens the existing addendum's Correction 2**: the seven HS-blocked waves really are blocked on Sindre's decisions, not on ML. Four decisions unlock ~10 waves with no ML dependency. That second front should not idle waiting on M6.

## 7. One boundary to confirm with Sindre

CL.md's B17 row says *"**`DESIGN_REVISION` scoping** for planned objects"*. What 67g actually ships is a `revision TEXT` column that NCE **stores and never interprets** — inert; 67g2 will join it into the read. Retirement/sibling-scoping semantics are **Copper-side flow** per Rev 2 §7 (and explicitly *not* netbox-branching, which is PolyForm-licensed and forbidden).

If Copper expects NCE to scope competing `planned` revisions, that is a gap. If Copper does it client-side over a column NCE merely stores, it is covered. **The m6 guide says the latter; the CL.md wording reads like the former.** One sentence from Sindre settles it.

## 8. Corrections to `docs/nce_seam_audit.md`

It predicted its own rot and was right:

- **`TOOL_REGISTRY` is 123, not 119** — heading to 124 when 67h lands.
- 🔴 **"five test edits" per new tool is wrong — it is TWELVE.** I re-derived this by measurement, not memory. For a tool with `mutation=True, admin_only=True`: 4 total-count sites, 3 mutation-count sites, 3 admin-only-count sites, the module name-set, and `docs/API.md` (both the tool row and the `_Totals:` line, which also moves for a new REST route). Two traps: `tests/test_project_advance.py` holds **two** live pins, not one, and its own module header is stale prose; and `from nce.tool_registry import TOOL_REGISTRY` **raises without `NCE_MASTER_KEY`** set, so counting interactively fails closed and looks like a broken registry.
- The **registry↔`TOOLS` divergence is smaller than recorded**: registry holds 6 `system_design_*`, `TOOLS` holds 4. The gap is exactly the two legacy tools `system_design_ping` and `system_design_publish_design_docs`, and 67j backfills them.

## 9. Two facts for Copper's own design, from M6's audits

- 🔴 **BFF security.** With `NCE_MCP_NAMESPACE_ID` unset, `namespace_id` is taken from the argument bag **unchallenged** — an auditor authored a full topology into an unrelated tenant through the real dispatch path. That is the deployed tenancy model for **all** tools, but the authoring tools are the first where it means cross-tenant **writes**. The BFF must pin the namespace server-side and never accept it from the browser.
- 🔴 **For B18 (delete).** No foreign key ties a side-table row (`_device_capabilities`, `_geometry`, `_node_state`) to its `kg_nodes` node. Inert today because no delete path exists — **it stops being inert the moment 67h lands, because 67h *is* the delete path.** Delete a node, the state row survives, the same label is re-authored, and the new node **silently inherits the orphan's `status`**. 67h must delete side-table rows in the same transaction; the obligation is recorded in migration 061's header. Copper's B18 scope should assume it.

---

## What ML needs from Copper

1. **Nothing blocking.** M6 runs to completion on its own queue.
2. **Update B77's fixtures** against §3/§4 when 67e/67g reach `origin/main` — the `racks`/`geometry` additions and the `version` type change are exactly what those pins exist to catch.
3. **Sindre's answer on §7** (`DESIGN_REVISION`), because it decides whether 67g2 grows scope or not.
4. If HS-5 is near, **say so** — `BOM_LINE` needs an ML representation wave with real lead time, and it has none today.
