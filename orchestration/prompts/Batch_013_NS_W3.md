# Batch 013 — NS.Wave 3 — `author-adapter` (runs in the NCE repo · T3 — independent reviewer runs before TAG)

> **FRESH SESSION REQUIRED.** Fully self-contained brief; one wave = one session = one branch = one commit = one TAG.
> **Engine class:** Flash (Gemini Flash 3.7 High, turbo). Unwritten design decision → STOP and report.
> **Workspace:** NCE worktree `NCE-Copper`, branch `copper/b013-author-adapter` off fresh `origin/main` (rebased after B12 merges). Shared-repo rules as in Batch 012 header.
>
> **⚠ [HOLD-ML] 2026-08-28:** handed to the NCE ML orchestrator (M6.W13b). Do not dispatch until the boot content-check confirms ML has NOT landed it. If dispatched Copper-side, apply the m6 guide's Rev 2 amendments (actor param, expected_version, cache-generation bump).

Rules 1–11 of `orchestration/_TEMPLATE.md` apply **with rule 1's branch replaced by the branch named above and rule 5's gate replaced by the NCE gate** (as Batch 012: make lint/typecheck delta, serial acceptance, parallel regression vs baseline, `NCE_MCP_NAMESPACE_ID=""`, CRLF care).

**Skills:** python-pro (primary), mcp-builder, security-auditor
**Depends on:** B12
**Reads (context, do not edit):** `nce/vertical_modules/system_design/devices.py` (`do_author_device_topology` ~305–511) · `graph.py` (`do_author_functional_location` ~264–481) · `nce/entity_resolution/ownership.py` (`assert_owner`)
**Files (exactly these):**
- `nce/vertical_modules/system_design/mcp_handlers.py` (two new handlers)
- `nce/tool_registry.py` (two `ToolSpec`s: `system_design_author_topology`, `system_design_author_functional_location` — both `cacheable=False, admin_only=False, mutation=True`) — **chokepoint**
- `nce/mcp_stdio_tools.py` (two `TOOLS` entries with full input schemas mirroring the `do_*` signatures)
- `nce/admin_app.py` (two POST routes — exactly `POST /api/system-design/topology` and `POST /api/system-design/functional-location`; these paths are contractual, Copper's client is built against them) + `nce/admin_handlers/system_design.py`
- The five count tests (+2 each; grep-verify current numbers first, as in Batch 012)
- `tests/unit/test_system_design_author_adapter.py` (new)

**Three things you must NOT do — each would be a defect:**
- **Do NOT modify `devices.py` or `graph.py`.** This wave wraps the existing `do_author_*` functions verbatim. If their signatures don't fit a clean tool schema, STOP and report — reshaping the domain layer is not this wave.
- **Do NOT touch `nce/config_data/node-ownership.json`.** All eight design node types (`DEVICE, PORT, SIGNAL_CHAIN, RACK, CABLE, FUNCTIONAL_LOCATION, DESIGN, DESIGN_LINE`) already have `system_design` rows; you need no new ownership. If `assert_owner` denies a write in your tests, the cause is namespace seeding — check `ownership_seed.py` usage in existing tests, do not edit the registry.
- **Do NOT add delete, patch, or geometry parameters.** Those are B18/B15. The tools expose exactly what `do_author_*` accepts today.

**Goal:** the first externally reachable write surface for Module 6. Two MCP tools + two POST routes wrapping `do_author_functional_location` and `do_author_device_topology`, argument-validated (pydantic-free `_Config` house style — mirror an existing mutation handler such as the assets ones from Batch 143), namespace-required, results echoing what was written (labels created/updated).

**Steps:**
1. Study one existing mutation tool end-to-end (an `assets_*` mutation from **NCE ML ledger Batch 143** — an NCE batch number, not a Copper one) — handler shape, error mapping, event/audit hooks — and mirror it exactly.
2. Implement both handlers; map domain exceptions to MCP error payloads (no raw tracebacks).
3. Registry + `TOOLS` + REST + the five count tests.
4. `test_system_design_author_adapter.py`: (a) author an FL tree + a 2-device/2-port/1-cable topology through the DISPATCH path, read back via `system_design_get_topology` (B12) and assert every node/edge; (b) **idempotency**: call twice with identical payloads → identical read-back, no duplicate edges (the `UNIQUE (subject,predicate,object,namespace)` constraint is the mechanism — prove it's load-bearing, don't assume); (c) tenant isolation through the owner pool with the SAME labels in two namespaces; (d) ownership: with the seeding fixture removed in a scratch copy, the write raises the `assert_owner` denial.
5. Full NCE gate; commit.

**Acceptance:** all four test groups green serially; both tools in BOTH registries; zero new regression failures vs baseline.

**§6.4 mutation table (minimum, this is a T3 wave — the reviewer re-runs these):** (1) skip `assert_owner` path (scratch: blank the ownership seed) → denial test RED→ this proves the guard, restore; (2) drop the edge-uniqueness reliance (scratch: append a suffix to predicate on second call) → idempotency test RED; (3) remove namespace pin from the read-back → isolation test RED; (4) return-contract mutation: swap `created` and `updated` labels in the result → echo test RED (distinct fixture values so a transposition fails, not just a null).

## Final: as `orchestration/_TEMPLATE.md` §Final — STOP and report; no PR, no push. State out loud per Contract A: this wave writes ONLY node types owned by `system_design`, via the owner's own domain functions. Name what you did NOT verify (live-stack integration = orchestrator's pass; concurrent-writer behavior; performance on large topologies).
