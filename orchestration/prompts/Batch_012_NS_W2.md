# Batch 012 — NS.Wave 2 — `read-adapter` (runs in the NCE repo)

> **FRESH SESSION REQUIRED.** Fully self-contained brief; one wave = one session = one branch = one commit = one TAG.
> **Engine class:** Flash (Gemini Flash 3.7 High, turbo). Unwritten design decision → STOP and report.
> **Workspace:** the NCE worktree `…\systemer\Neuro-Cognitive Engine\NCE-Copper` (branch `copper/b012-read-adapter` off fresh `origin/main`). This is a SHARED repo co-written by another orchestrator: never run `git checkout`/`stash`/`restore` outside your branch; if `git status` shows files you did not touch, STOP and report.
>
> **⚠ [HOLD-ML] 2026-08-28:** this scope was handed to the NCE ML orchestrator (`docs/m6_completion_guide.md`, wave M6.W13a). **Do not dispatch this brief until the boot content-check confirms ML has NOT landed it.** If dispatched Copper-side, apply the guide's Rev 2 amendments (actor param, version token, cache-generation bump, extra-keys port-class mapping).

Rules 1–11 of `orchestration/_TEMPLATE.md` apply **with rule 1's branch replaced by the branch named above and rule 5's gate replaced by the NCE gate**: **`make lint && make typecheck` clean (mypy: report the DELTA vs main, not an absolute — the repo has a known baseline) · your acceptance tests green serially · `pytest -n auto -m "not integration and not perf" -q` with zero NEW failures vs the baseline recorded on the B11 ledger row · run pytest with `NCE_MCP_NAMESPACE_ID=""`.** Files here are CRLF in the working tree — if you script an edit, match on the file's real line endings and assert every replacement matched.

**Skills:** python-pro (primary), fastapi-pro, mcp-builder
**Depends on:** B11 (seam recon — its row carries the re-verified tool counts; READ IT via the orchestrator's dispatch note)
**Reads (context, do not edit):** `nce/vertical_modules/system_design/validation_queries.py` (the `_fetch_*` helpers at ~373–553 — verify the symbols, line numbers rot) · `nce/vertical_modules/system_design/mcp_handlers.py` · `docs/nce_seam_audit.md` in the Copper repo (orchestrator attaches its content to the dispatch)
**Files (exactly these):**
- `nce/vertical_modules/system_design/read.py` (new — the promoted read layer)
- `nce/vertical_modules/system_design/mcp_handlers.py` (one new handler)
- `nce/tool_registry.py` (one `ToolSpec`: `system_design_get_topology`, `cacheable=True`, `admin_only=False`, `mutation=False`) — **chokepoint**
- `nce/mcp_stdio_tools.py` (the `TOOLS` schema entry — the registry/advertised split is a known defect; your tool must appear in BOTH)
- `nce/admin_app.py` (one route: `GET /api/system-design/topology`) + `nce/admin_handlers/system_design.py` (handler)
- Count-test edits, exactly these five: `tests/test_tool_registry.py` (`_EXPECTED_TOTAL` +1), `tests/unit/test_assets_surface.py`, `tests/unit/test_inventory_surface.py`, `tests/unit/test_sales_skeleton.py` (cardinality +1 each), `tests/unit/test_system_design_toolcount.py` (add the name + flags to the exact set)
- `tests/unit/test_system_design_read_adapter.py` (new)

⚠ **Verify the counts at dispatch reality, not this brief:** run `grep -rn "_EXPECTED_TOTAL\|TOOL_REGISTRY) ==" tests/` first; if the numbers differ from what the B11 row recorded, STOP and report before editing.

**Goal:** one structured read: `system_design_get_topology(namespace_id, design_label, statuses=None)` returning `{design, functional_locations[], devices[{node, capabilities, ports[{node, capabilities}]}], cables[], edges[{subject, predicate, object}]}` — by **promoting** the private `_fetch_*` queries into `read.py` (move + generalize; `validation_queries.py` imports from `read.py` afterward so there is ONE query set). `statuses` is accepted and threaded through but filters nothing yet (the status column arrives in B17) — document that in the docstring, honestly. Namespace is pinned in SQL explicitly per house pattern (owner pools bypass FORCE RLS).

**Steps:**
1. Create `read.py`; move the `_fetch_*` bodies, generalize the design-label parameter, keep `validation_queries.py` behavior byte-equivalent (its tests must stay green untouched).
2. MCP handler + `ToolSpec` + `TOOLS` schema (with `namespace_id` required, per house convention).
3. REST GET handler with `validate_agent_id`-style namespace validation (mirror the existing handler in `admin_handlers/system_design.py`).
4. The five count-test edits.
5. `test_system_design_read_adapter.py`: seed a two-device topology via `do_author_device_topology` (in-process, as existing tests do), read it back via the tool through the dispatch path, assert structure; **tenant-isolation proof through the owner pool**: seed the same design label in two namespaces, assert the read returns only the requested namespace's rows.
6. Full NCE gate; commit.

**Acceptance:** new test green serially; `tools/list` (unit-level: the `TOOLS` structure) contains the tool; zero new failures vs baseline; `validation_queries.py`'s existing tests untouched and green.

**§6.4 mutation table (minimum):** (1) remove the SQL namespace predicate in a scratch copy → isolation test RED (this is the §6.4 named trap — prove the discriminator is the predicate, not a fixture uniqueness: use the SAME design label in both namespaces); (2) drop the tool from `TOOLS` only → your advertised-set assertion RED; (3) return `edges` unfiltered by design → structure test RED.

## Final: as `orchestration/_TEMPLATE.md` §Final — STOP and report; do NOT open a PR (the orchestrator PRs after TAG; merges to NCE main need Sindre's go). Name what you did NOT verify (at minimum: the REST route against a live server — integration is the orchestrator's pass; status filtering is a stub by design).
