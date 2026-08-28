# Module 6 completion guide — build spec for the NCE ML orchestrator

> **Status:** handoff · **Rev 2** (2026-08-28, same day — adversarial audit of the Copper plan amended this guide; every change is in the Rev 2 block below so you can diff) · **From:** Sindre (via the Copper planning session) · **To:** the ML orchestrator, to be pushed UP FRONT in the queue
> **Grounding:** a full write-surface audit of NCE at `30f1c27` (2026-08-28). Symbols cited by name — re-verify against current `main` at dispatch; line numbers rot.
> **This is a SPEC, not briefs.** You (ML orch) assign Batch numbers as ORCH-INSERTED rows, author the briefs per your `_TEMPLATE.md`, and run your own TAG gate. Wave letters below are module-local addresses only.

## Rev 2 amendments (contract-shaping — read before authoring W13b/W14 briefs)

1. **`actor` on every mutation.** All mutation tools (W13b author pair, W17 delete, W16 status writes) accept an optional `actor` (string, the human's UPN) recorded in the event payload. The HMAC/MCP key authenticates the calling service; `actor` attributes the human. Omitted → recorded as absent, never invented.
2. **Optimistic-concurrency token.** Two canvas users on one design must not silently last-writer-win over whole-list upserts. W14 adds a per-design `version BIGINT` (side-table row keyed by the DESIGN label); W13a returns it; W13b/W17/W16 accept optional `expected_version` → reject with a distinct conflict error when stale, increment on success. Cheap now; reshapes the write tools if retrofitted.
3. **Cache invalidation acceptance.** `system_design_get_topology` is `cacheable=True`; W13b/W16/W17 acceptance must prove write→read-back **through the cached path** returns fresh data (cache-generation bump per house pattern) — the exact defect class the recent 19-route REST→MCP invalidation fix closed.
4. **W14 column set extended:** add `cable_length_m NUMERIC` and `cable_type TEXT` (cable rows, keyed by cable label — the seam audit named this gap and Rev 1 dropped it). **Units/axes are normative:** `x`/`y` are in canvas grid units (1 unit = one grid cell; Copper's pitch), origin top-left, y-down; exporters convert. Room dimensions ride in `meta` under reserved keys (`copper.room.w/d/h`, meters).
5. **Port component-class mapping (NetBox methodology).** NCE has one `PORT` node type; Copper's model distinguishes NetBox component classes. Persist in `system_design_device_capabilities.extra` under reserved keys: `copper.port_kind` (`interface|front|rear|console|power_port|power_outlet`), and for front ports `copper.rear_port` (rear port's node label) + `copper.rear_position` (int). W13a returns them verbatim; no new columns, no semantics in NCE — NCE stores, Copper interprets.
6. **Correction — "five node types" is wrong; it is eight:** `DEVICE, PORT, SIGNAL_CHAIN, RACK, CABLE, FUNCTIONAL_LOCATION, DESIGN, DESIGN_LINE` all carry `system_design` ownership rows. Wherever Rev 1 said five (Contract A note; the no-registry-edits claim) read eight. The no-`node-ownership.json`-edits rule still holds for W13–W18 **because W16's `revision` is a TEXT column, not a node** — if you instead model revisions as nodes, that DOES need an ownership row + per-namespace seeding, and say so out loud.
7. **W16 scope sharpened:** `revision TEXT` on the side-table only. Sibling-retirement semantics (one promoted revision retires the others) are Copper-side flow logic and OUT of this wave.
8. **Named out-of-scope, so the omission is a decision, not a defect:** cable-path **tracing** (front/rear traversal per NetBox semantics) is NOT in this guide — it is future Module 6 work; the "Done means" list below does not include it.

## Why this lands now

Module 6 is marked **W1–W12 COMPLETE** in ML.md, but it is the unfixed instance of your own Plan-defect family #2, the **surface hole**: the surface wave (W1) shipped one ping before the cores existed (W2–W12), and `tests/unit/test_system_design_toolcount.py` then pinned the 2-tool shortfall as correct. The prescribed fix — a surface-completion wave before hardening — was scheduled for eight other modules and never for Module 6. Result, verified: **`do_author_device_topology`, `do_author_functional_location`, `validate_design_graph` and the topology reads are implemented, test-covered, and unreachable by any MCP tool, REST route, or A2A skill.** NCE's own doc says so (`docs/engines/system-design-user.md`: "CANNOT be invoked over MCP or REST endpoints today").

**Module 6 is now on the critical path of Copper** — the new front end for the vertical suite (private repo `sindrehaugen/Copper`). Copper builds against the contract table below; every name and flag in it is load-bearing.

## The contract Copper consumes (pin these names exactly)

| MCP tool | Flags | REST | Wraps |
|---|---|---|---|
| `system_design_get_topology` | cacheable=True, admin_only=False, mutation=False | `GET /api/system-design/topology` | promoted `_fetch_*` reads |
| `system_design_author_topology` | cacheable=False, admin_only=False, mutation=True | `POST /api/system-design/topology` | `do_author_device_topology` |
| `system_design_author_functional_location` | cacheable=False, admin_only=False, mutation=True | `POST /api/system-design/functional-location` | `do_author_functional_location` |
| `system_design_validate_design_graph` | cacheable=False, admin_only=False, mutation=False | `POST /api/system-design/validate` | `validate_design_graph` |
| `system_design_delete_planned` (W17) | cacheable=False, admin_only=False, mutation=True | `DELETE /api/system-design/planned` | new (W17) |

Read tool result shape (W13a): `{design, functional_locations[], devices[{node, capabilities, ports[{node, capabilities}]}], cables[], edges[{subject, predicate, object}]}` + geometry fields once W14 lands. `statuses` param accepted from W13a (no-op until W16 — documented honestly in the docstring).

## Standing costs & traps (apply to every wave here)

- **Every tool wave edits BOTH registries** — `nce/tool_registry.py` (dispatch, 119 entries) and `nce/mcp_stdio_tools.py` (`TOOLS`, 71 — they have diverged; 48 tools are dispatchable but unadvertised). A tool absent from `TOOLS` is invisible to `tools/list`.
- **Five pinned count tests break per added tool** — `tests/test_tool_registry.py` (`_EXPECTED_TOTAL`), `tests/unit/test_assets_surface.py`, `tests/unit/test_inventory_surface.py`, `tests/unit/test_sales_skeleton.py` (all `== 119` today), `tests/unit/test_system_design_toolcount.py` (exact name-set + flags). Grep `_EXPECTED_TOTAL\|TOOL_REGISTRY) ==` at dispatch — numbers rot.
- **Migration numbers are pre-allocated by you at dispatch**, never self-picked from a directory listing (in-flight waves own unmerged numbers).
- **Owner pools bypass FORCE RLS** — every isolation test runs through the owner pool with the SAME labels seeded in two namespaces; the discriminator must be the SQL namespace predicate, not fixture uniqueness (§6.4's named trap).
- **§6.4 everywhere:** every guard claimed → mutated RED in a scratch copy, table in the report.
- **Contract A:** all eight design node types (`DEVICE, PORT, SIGNAL_CHAIN, RACK, CABLE, FUNCTIONAL_LOCATION, DESIGN, DESIGN_LINE`) are `system_design`-owned in `node-ownership.json` — no registry edits needed for W13–W18 (see Rev 2 §6 for the one conditional exception). **BOM_LINE is explicitly OUT of this guide's scope** (that is B132a/133b + debt items 7/19/20; a separate coordination with Copper comes later — do not let any wave here touch it).
- **`_`/`%` never appear in generated labels** (LIKE-wildcard bug class, `cascade.py`'s documented incident).

## The waves (ORCH-INSERTED; run in this order, letters may parallelize only where stated)

### M6.W13a — surface-read · T2
Promote the module-private reads into `nce/vertical_modules/system_design/read.py`: move the `_fetch_*` bodies from `validation_queries.py` (~373–553), generalize by design label, have `validation_queries.py` import from `read.py` (ONE query set; its existing tests stay untouched and green). Register `system_design_get_topology` (both registries + REST GET + the five count tests). Namespace pinned in SQL. Acceptance: seed via `do_author_device_topology` in-process, read back through the dispatch path; owner-pool isolation proof; mutation table incl. "namespace predicate removed → RED".

### M6.W13b — surface-author · T3 (independent reviewer before TAG)
Two mutation tools wrapping the existing `do_author_*` **verbatim — no domain-layer edits**; if signatures don't fit a clean schema, STOP and report. Both registries + two POST routes + count tests. Acceptance: author→read-back round trip through dispatch; **idempotency proven** (double-call → identical read-back; the `UNIQUE(subject,predicate,object,namespace)` edge constraint is the mechanism — prove it is load-bearing); owner-pool isolation; ownership-denial RED with seeding removed (scratch). Return contract mutation-tested field-by-field (distinct fixture values so transpositions fail).

### M6.W13c — surface-validate · T2 (may run parallel with W13b — different tool rows, but they SHARE the registry chokepoint: serialize the registry edit or letter-split the count-test bump)
`system_design_validate_design_graph` wrapping the pure-read five-check function. Do NOT modify `validation_queries.py` semantics (unknown formats warn-only; power/heat informational `passed=True`). Acceptance: continuity violation → `passed=False` with reason; clean → `passed=True`; scratch-neutered check → test RED; namespace isolation.

### M6.W14 — geometry-store · T2 · dep W13b
New FORCE-RLS table `system_design_geometry` (`namespace_id, node_label, x NUMERIC, y NUMERIC, rack_position NUMERIC(4,1), rack_face TEXT CHECK IN ('front','rear'), cable_length_m NUMERIC, cable_type TEXT, meta JSONB NOT NULL DEFAULT '{}'`), same `(namespace_id, node_label)` key shape as `system_design_device_capabilities`, tenant policy per migration 039's pattern; plus the per-design `version BIGINT` row (Rev 2 §2). Units/axes per Rev 2 §4 — normative, documented in the migration header. Fold read into W13a's result and accept geometry in W13b's tools (optional per node). **Naming is contractual: NetBox vocabulary `position`/`face`** (Copper follows the NetBox methodology as a binding ADR). Migration number pre-allocated by you.

### M6.W15 — cable-two-ended · T2 · dep W13b
Fix the verified defect: `uses_cable` docstring says `DEVICE -[uses_cable]-> CABLE`, implementation writes `PORT -[uses_cable]-> CABLE` **source port only** (`devices.py` ~492–501), so a cable is not traversable as a two-ended object. Decide docstring-vs-implementation explicitly (recommend: PORT→CABLE from BOTH terminations; update docstring), backfill-safe (existing rows preserved; write the missing second edge idempotently on re-author). RED-first traversal test.

### M6.W16 — status-lifecycle · T3 · dep W14 · 🛑 HARD-STOP: Sindre signs the vocabulary BEFORE dispatch
The design-state gap: `kg_nodes` has no status; "propose-only" in this module means return-only; a canvas needs persistent intent. Decision proposed to Sindre (Copper ADR-0003, summarized here so this guide is self-contained): **`status` column on the Module 6 side-table** (geometry table or a sibling, same key/RLS pattern), **NetBox vocabulary** — devices `planned|staged|active|offline|decommissioning|inventory|failed`, cables `planned|connected|decommissioning`, racks `reserved|available|planned|active|deprecated` — default **`planned`** for canvas writes; `statuses` filter goes live in the read tool; a lightweight `revision TEXT` scopes competing `planned` options (retirement semantics are Copper-side, Rev 2 §7; NOT netbox-branching, which is PolyForm-licensed and forbidden). Promote (`planned→active`) stays OUT of this wave — it is Copper's flow via `do_validate_design` + the first `action_approval_queue` writer, coordinated later.

### M6.W17 — delete-planned · T3 · dep W16 · 🛑 HARD-STOP: Sindre approves the deletion design BEFORE dispatch
Today **no delete path exists anywhere** (zero `DELETE FROM kg_nodes/kg_edges` in vertical modules) — a canvas cannot remove a mis-dropped device. Scope strictly to `status='planned'` objects: event-logged removal of node + its edges + capability + geometry rows, tool `system_design_delete_planned` (both registries, count tests, REST DELETE). `active` deletion is explicitly out of scope and stated so in the tool's docstring and report. WORM/event-log implications are exactly why Sindre gates this.

### M6.W18 — signal-chain-resolution · T1 (decision wave, minimal code)
`SIGNAL_CHAIN` is a phantom: registered in `node-ownership.json`, declared in `devices.py`, `signal_chain_label` has zero call sites — no writer anywhere. Recommend: **formally retire** (chains are `connected_to` walks; document in the module README + remove the dead label helper, keep the ownership row inert or remove it — your call under Contract A hygiene), rather than inventing an unrequested writer. Either way the ambiguity ends and the decision is recorded.

### M6.W19 — surface-hardening + doc fixes · T1 · dep all above
Re-pin the five count tests at their new totals; add an advertised-parity assertion for the `system_design_*` set (registry ∧ `TOOLS` — the divergence class this module just suffered); §9.8 coverage gate clean; **FE report per §9.5** (Copper is the consumer — the contract table above is the report's spine); fix the two verified doc bugs: `docs/engines/system-design-user.md` cites a non-existent `/api/system-design/publish` alias, and `ML.md`/`validation_queries.py` cite migration 038 where the capabilities table is 039.

### M6.W20 — integration sweep (§9.9) · T2 · dep W19
Orchestrator-run against the live local stack: author FL tree + topology through the REST surface (HMAC), read back, validate, geometry round-trip, delete a planned device, Lucid publish still green. Zero new failures vs the recorded baseline (re-measure the baseline WITH its env block first — a baseline without its environment is not a baseline).

## Done means

Every `do_*` core of Module 6 reachable over MCP **and** REST · both registries in parity for `system_design_*` · geometry + status storage live · delete-planned live · cable edge two-ended · SIGNAL_CHAIN resolved · docs corrected · FE report published · §9.8/§9.9 clean · all waves `[PASSED TAG]`. Copper's orchestrator will content-verify each item on `main` (grep for the tool symbols) and consume them as they land — tool names and flags exactly as the contract table, or Copper breaks.
