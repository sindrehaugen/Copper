# NCE seam audit — what exists TODAY vs what Copper needs

> **Status:** verified · **Verified-against:** NCE working tree at `30f1c27` (branch `fix/rest-mcp-cache-invalidation`, 2026-08-28) · **Last-audited:** 2026-08-28
>
> ⚠ **This document rots.** NCE moves fast and is co-written by the ML orchestrator. Wave **NS.W1 re-verifies every row here against current `main` before any NS code wave dispatches** — per NCE §7.4: never assert "X is on main" without `git fetch` + content check immediately before acting.

## Headline verdict

**An external client cannot create a DEVICE with PORTs and connect a CABLE today.** The Module 6 domain layer is ~90% built; the externally-reachable adapter layer is 0% built. NCE's own docs state it: *"Interactive topological design … CANNOT be invoked over MCP or REST endpoints today"* (`docs/engines/system-design-user.md:10-13`).

## What EXISTS (build against it, don't rebuild it)

| Capability | Where | Notes |
|---|---|---|
| Node types `DEVICE/PORT/SIGNAL_CHAIN/RACK/CABLE` + `FUNCTIONAL_LOCATION/DESIGN/DESIGN_LINE` | `nce/config_data/node-ownership.json`, `system_design/devices.py`, `graph.py` | Owner engine `system_design`, deny-by-default via `assert_owner` |
| Whole-topology writer `do_author_device_topology` | `system_design/devices.py:305-511` | Writes DEVICE/PORT/RACK/CABLE + `contains/has_port/connected_to/mounted_in/uses_cable/has_rack` edges + capability rows. Upsert-only over full lists |
| FL-tree/DESIGN writer `do_author_functional_location` | `system_design/graph.py:264-481` | `FL:<NS>:<SITE>:<BUILDING>:<FLOOR>:<ROOM>:<POSITION>` labels, `parent_of` hierarchy edges |
| Read queries for topology | `system_design/validation_queries.py:373-553` (`_fetch_*`, module-private) | Exactly the reads Copper needs — promote, don't rewrite |
| `validate_design_graph` (5 checks, pure read) | `validation_queries.py:561-647` | Signal-flow continuity, format/version compat, power/heat (informational), SPOF redundancy, AVIXA conformance |
| AVIXA capabilities table | `system_design_device_capabilities` (migration 039) | PORT: signal_format/version/direction/PoE class+watts/Dante ch. DEVICE: power/heat/redundancy/category/manufacturer/model. `extra` JSONB. FORCE RLS |
| Human decision gate | `system_design/validate.py:195-293` (`do_validate_design`) | Explicit accept/override per line; no confidence auto-accept. The natural "commit" step |
| Approval queue table (no writer yet) | `action_approval_queue` (`schema.sql:2115-2131`) | pending/approved/rejected/executed/expired + `dry_run_result` — best fit for the promote flow |
| NetBox bridge | `system_design/netbox_bridge.py` | `sync_to_netbox` / `promoted_to_asbuilt` / `has_divergence` edges — the as-built/divergence loop already has bones |
| Extension seams (SHIPPED) | `build_app(extra_routes, extra_middleware)` (`admin_app.py:824`), `register_tool()` (`tool_registry.py:792-816`) | NCE-FE-1/NCE-FE-2 — the sanctioned way in; never fork `nce/` |
| Auth | MCP: `mcp_api_key`/`admin_api_key` tool args; REST: HMAC-SHA256 (`X-NCE-Timestamp` + canonical message) + optional mTLS | Server-side secrets only — no browser path |

## What is MISSING (the NS lane builds these)

| Gap | Severity | NS wave |
|---|---|---|
| No reachable write tool (MCP/REST) for topology | 🔴 blocks everything | NS.W3 |
| No reachable structured read (`graph_search` is embedding-anchored NL only) | 🔴 blocks read-only projection | NS.W2 |
| No delete or partial-patch path anywhere (`DELETE FROM kg_nodes/kg_edges` count: zero) | 🔴 canvas cannot remove a device | NS.W8 (design HARD-STOP) |
| No geometry storage (no X/Y, no rack U-position/face, no cable length/type column) | 🔴 canvas cannot persist layout | NS.W5 |
| No draft/status state (`kg_nodes` has no status column; "propose-only" means return-only) | 🔴 ADR-0003 | NS.W7 |
| `validate_design_graph` unreachable externally | 🟠 | NS.W4 |
| BOM_LINE not implemented — label convention + readers only; not in node-ownership.json; no `has_status` writer; ORDERED/INSTALLED/TESTED appear nowhere | 🟠 (late phase) | B-lane, **coordinate with ML** (Batches 132a/133b territory) |
| `uses_cable` edge is one-ended (PORT→CABLE, source only) and contradicts its docstring | 🟠 breaks cable traversal | NS.W6 |
| SIGNAL_CHAIN is a phantom (declared+owned, zero writers) | 🟡 model chains as `connected_to` walks | decision recorded, no wave |
| `TOOL_REGISTRY` (119) vs advertised `TOOLS` (71) divergence — 48 tools dispatchable but invisible | 🟡 every NS tool must be added to BOTH + `tests/unit/test_system_design_toolcount.py` | all NS waves |
| No CORS / browser JWT / MCP-over-HTTP | 🔴 forces the BFF | Copper `bff/` (P.W1) |

## The gap is diagnosed, closed, and unfunded — Copper pays for it

NCE's own ledger (`vertical_modules/dev/prompts/ML.md`, "Plan defects" sweep 2026-08-16) names this exact shape as systemic defect #2, the **"surface hole"**: every module got ONE surface wave before most of its `do_*` cores existed, and its hardening wave then pinned an exact tool count, *ratifying its own shortfall as correct*. Module 6 is precisely that: surface wave = the ping (W1), cores = W2–W12, then `test_system_design_toolcount.py` froze the 2-tool answer. ML.md marks **Module 6 W1–W12 COMPLETE** with zero pending rows, and the prescribed "surface-completion wave" was scheduled for eight other modules but **not Module 6**. Nothing in the 231-wave plan delivers the write surface Copper needs — the NS lane is not duplicating scheduled work, it IS the unscheduled fix.

**Exact cost of adding one MCP tool** (each NS surface wave budgets these edits):
handler + `ToolSpec` in `nce/tool_registry.py` + schema entry in `nce/mcp_stdio_tools.py` + REST route + **five test edits**: `tests/test_tool_registry.py` (`_EXPECTED_TOTAL`, currently 119), `tests/unit/test_assets_surface.py:171`, `tests/unit/test_inventory_surface.py:158`, `tests/unit/test_sales_skeleton.py:112` (all `== 119`), and `tests/unit/test_system_design_toolcount.py` (exact name-set + flags). Re-count at dispatch time — these numbers rot.

**BOM_LINE status per ML.md:** representation wave B132a is unlanded and blocking B133; B132d–B132i have ledger rows but **no brief files**; debt items 7/19 (creator) and 20 (`ORDERED/INSTALLED/TESTED` writers) unresolved. Treat BOM_LINE as greenfield and **coordinate with the ML orchestrator before any B-lane dispatch** — two orchestrators writing one repo is the §7.4 cross-orchestrator hazard.

## Traps recorded for wave briefs

- **Tool-count ratchet:** `tests/unit/test_system_design_toolcount.py:24-35` pins exactly 2 tools with exact flags — every NS tool wave edits it deliberately.
- **`_` in labels is a `LIKE` wildcard** (`cascade.py:452`): Copper must never mint ids containing `_` or `%` that can reach label-prefix lookups (quote ids are base36 for the same reason).
- **Owner pools bypass FORCE RLS** — design queries pin `namespace_id` in SQL explicitly (`validation_queries.py:386-388`); NS waves follow that pattern.
- **`store_memory` bypasses `assert_owner`** — latent ownership hole, not a usable path; do not "borrow" it.
- **Governance kill-switch runs before auth** and fails closed — the BFF must surface `-32005` (tool disabled) as a distinct state.
- **New node types must be added to `node-ownership.json` AND seeded per-namespace** (`ownership_seed.py`) or writes are denied.
- **MCP is stdio-only** — server-to-server REST+HMAC is the transport for the BFF; MCP tools are still registered for agent access parity (ADR-0006 §9: the canvas is one client among several).
