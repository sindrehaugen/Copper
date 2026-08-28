# Batch 014 — NS.Wave 4 — `validate-adapter` (runs in the NCE repo)

> **FRESH SESSION REQUIRED.** Fully self-contained brief; one wave = one session = one branch = one commit = one TAG.
> **Engine class:** Flash (Gemini Flash 3.7 High, turbo). Unwritten design decision → STOP and report.
> **Workspace:** NCE worktree `NCE-Copper`, branch `copper/b014-validate-adapter` off fresh `origin/main` (rebased after B13 merges). Shared-repo rules as in Batch 012 header.

Rules 1–11 of `orchestration/_TEMPLATE.md` with the NCE gate (as Batch 012).

**Skills:** python-pro (primary), mcp-builder
**Depends on:** B12
**Reads (context, do not edit):** `nce/vertical_modules/system_design/validation_queries.py` (`validate_design_graph` ~561–647 — pure read, five checks; verify by symbol)
**Files (exactly these):** `nce/vertical_modules/system_design/mcp_handlers.py` (one handler) · `nce/tool_registry.py` (`system_design_validate_design_graph`, `cacheable=False, admin_only=False, mutation=False` — not cacheable: results must reflect the current graph) — **chokepoint** · `nce/mcp_stdio_tools.py` (schema) · `nce/admin_app.py` + `nce/admin_handlers/system_design.py` (one POST route — POST because the body carries the design ref) · the five count tests (+1 each; grep-verify first) · `tests/unit/test_system_design_validate_adapter.py` (new)

**Do NOT modify `validation_queries.py`** — the five checks and their warn-only semantics (unknown formats pass with a note; power/heat is informational, always `passed=True`) are the contract. If wrapping exposes a bug in them, STOP and report — fixing it is its own wave.

**Goal:** `validate_design_graph` reachable externally: MCP tool + REST route returning `{passed, reasons[]}` verbatim from the domain function.

**Steps:**
1. Handler wrapping `validate_design_graph` (namespace-required, design-label-required), mirroring B12's handler shape.
2. Registry + `TOOLS` + REST + five count-test edits.
3. Tests: seed via `do_author_device_topology` (in-process) — (a) a continuity violation (unconnected input port) → `passed=False` with the continuity reason; (b) a clean topology → `passed=True`; (c) unknown-format ports → still passes (warn-only semantics preserved); (d) tenant isolation: the violation in namespace A does not fail namespace B's validation.
4. Full NCE gate; commit.

**Acceptance:** all four tests green serially; tool in BOTH registries; zero new regression failures.

**§6.4 mutation table (minimum):** (1) scratch-neuter the continuity check (return early) → test (a) RED — proving your test exercises the real check, not a fixture accident; (2) drop namespace threading → test (d) RED; (3) hijack each new test (`assert True is False` at top) → exactly that one fails.

## Final: as `orchestration/_TEMPLATE.md` §Final — STOP and report; no PR, no push. Name what you did NOT verify (REST route against a live server; the three checks your fixtures don't violate — SPOF, format-compat, AVIXA conformance — validated only via the clean-topology pass, say so).
