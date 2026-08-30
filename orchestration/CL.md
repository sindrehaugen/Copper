# Copper — Copper Ledger (CL)

> **Protocol Engine:** Flash-class coders (Gemini Flash 3.7 High in Antigravity, turbo) · strong-Gemini orchestrator · fresh-session auditors
> **Target:** Copper — the system design & integration front end for AV+IT on NCE (NetBox methodology binding, ADR-0006)
> **Methodology:** microstepped small-batch promptwaves, one fresh session per wave, TAG-audit-gated to DONE
> **Contract:** `orchestration/_ORCHESTRATOR.md` (binding) · brief skeleton `orchestration/_TEMPLATE.md` · audit `orchestration/protocols/TAG_AUDIT.md`
> **Plan source:** `docs/development_plan.md` · `docs/architecture.md` · `docs/nce_seam_audit.md` · ADRs `docs/decisions/`
> **This ledger is TRACKED in git** (deviation from NCE practice, deliberate: a gitignored ledger has no single source of truth — NCE §7.8's four-divergent-copies incident is the evidence). Orchestrator-only writes.

---

## Protocol (binding — read before running any wave)

1. **One wave = one fresh session/agent = one branch = one commit = one TAG audit.** Branch `cu-b{NNN}-{lane}-w{W}-{slug}` (Copper) / `copper/b{NNN}-{slug}` (NS lane, in NCE-Copper worktree). Never combine waves; never carry context between them.
2. **The TAG audit is the gate to DONE.** Coder finishes and STOPs (no CL.md edits, no PR, no push). Orchestrator flips `[NO TAG]→[WAITING TAG]`, dispatches the audit per tier, adjudicates, flips the row. Only `[PASSED TAG]` flips to `[DONE]`.
3. **Status vocabulary:** `[DONE]` · `[RUNNING]` · `[LOCKED]` (registered, not yet dispatched — deps unmet or queued; the orchestrator flips it to `[RUNNING]` at dispatch) · `[HOLD-HS{n}]` (waiting on a named HARD-STOP) · `[HOLD-ML]` (scope handed to the NCE ML orchestrator; see the NS lane note) · `[HOLD-ML+HS{n}]` (both) · `[ADOPTED — ML <batch>, content-verified <sha>]` (terminal: ML landed the scope under its own TAG gate; the orchestrator's content-verification is the adoption record — the rule-3 carve-out, never a hand-marked `[DONE]`). TAG: `[NO TAG]` → `[WAITING TAG]` → `[PASSED TAG]` / `[FAILED TAG]`. Markers: `[ORCH-INSERTED]`, `[SPLIT into Na/Nb]`, `KEEP` (recorded sizing verdict).
4. **Tiers recorded at dispatch** (T1/T2/T3 per `_ORCHESTRATOR.md` §6.1); escalate, never downgrade. Every T3 gets an independent reviewer.
5. **The licence firewall is absolute** (`_ORCHESTRATOR.md` §3, ADR-0005). Clean-room waves (B28, B45–B48) carry do-not-open path bans in their briefs.
6. **Sequencing = critical path, not numeric.** F ∥ K ∥ NS from boot; only ONE NS wave in flight at any time (shared-repo hazard). HARD-STOPs halt a lane, not the run.

Legend per row: `[STATE] B{N} — {Lane}.W{W} {slug}: {what} · tier: {T} · dep: {…} [TAG]`, plus an indented `Files/Goal/Accept` detail line **where one has been authored** (F-lane and near-horizon rows carry them now; later rows carry Goal-level sentences). **A row cannot be dispatched until its detail line exists** — the orchestrator populates it (normally one wave ahead), then authors the brief from row + `_TEMPLATE.md`, verifying every citation against the tree.

## HARD-STOPs

| Gate | Blocks | Sindre decides |
|---|---|---|
| 🛑 HS-1 | B17 | ADR-0003 sign-off (status vocabulary + design revisions) |
| 🛑 HS-2 | B18 | Delete semantics (WORM/audit one-way door) |
| 🛑 HS-3 | B31+ (E lane) | Premise check on the integration read-only proof (B26) |
| 🛑 HS-4 | B35 | Promote flow (first `action_approval_queue` writer) |
| 🛑 HS-5 | B59 | BOM_LINE: adopt-into-ML vs Copper-funded (cross-orchestrator coordination) |
| 🛑 HS-6 | B56/B57 | First NetBox export/import against a real instance |
| 🛑 HS-7 | B62+ (W lane post-recon) | Which CAD integrations to fund, from B61's verified findings |
| 🛑 HS-8 | B72+ (M/C lanes) | Which module surfaces to build, in what order, from B71's two-sided inventory |
| 🛑 HS-9 | B75 (and thereby B34/B35/B70) | ADR-0011 identity/session/tenancy sign-off (Entra ID recommendation) |

---

## State Registry

### Lane F — Foundations (`app/` scaffold, gates, model core)

* [DONE] B1 — F.W1 app-scaffold: pnpm + Vite + React 19 + TS strict app, eslint flat config, vitest, CI (lint/typecheck/test) · tier: T1 · dep: — [PASSED TAG] (**2026-08-28: T1 gate verified by coder**)
  · Files: `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `app/**` (new), `.github/workflows/ci.yml`, `tsconfig*.json`, `eslint.config.js`, `vitest.config.ts`, `.gitignore` · Goal: empty app builds, gates run green in CI, folder layout `app/src/{model,layout,editor,views,exchange,store,shell}` exists with placeholder index · Accept: `pnpm lint && pnpm typecheck && pnpm vitest run` green locally and in Actions; `app/src/model/index.test.ts` trivially passes. Brief: `prompts/Batch_001_F_W1.md`
* [DONE] B2 — F.W2 licence-gate: licence-checker CI step + allowlist + forbidden-source scan · tier: T1 · dep: B1 [PASSED TAG] (**2026-08-28: T1 gate verified by coder**)
  · Files: `scripts/check-licences.mjs`, `scripts/forbidden-sources.mjs`, `.github/workflows/ci.yml` (one edit — chokepoint), `docs/decisions/0005-…` (link only) · Goal: CI fails on any dep outside MIT/BSD/Apache/ISC/CC0 and greps the diffable tree for forbidden-source markers (EasySchematic paths, `banesok`/`rutekvalitet`/`connectorAccepts` identifiers, Norwegian routing vocabulary) · Accept: seeded violation fixture makes both scripts exit non-zero (RED shown); clean tree passes. Brief: `prompts/Batch_002_F_W2.md`
* [DONE] B3 — F.W3 geometry-core: pitch constants + multiples ratchet · tier: T2 · dep: B1 [PASSED TAG] (**2026-08-28: T2 gate verified by Pro auditor**)
  · Files: `app/src/model/geometry.ts`, `app/src/model/geometry.test.ts` · Goal: single `PITCH`, card/header/row/port dims all exported and all multiples with **`PORT_ROW_H = 2 × PITCH`** (arithmetic requirement of the first-port-center invariant); one `PORT_DOT_INSET` (sole pre-seeded `NON_GRID_EXPORTS` entry); ratchet test iterates exports asserting `% PITCH === 0` · Accept: mutation (off-pitch dim) shown RED. Brief: `prompts/Batch_003_F_W3.md`
* [DONE] B4 — F.W4a schema-core [SPLIT into B4/B4b, sizing audit 2026-08-28]: containment + lifecycle half of the NetBox-shaped model · tier: T2 · dep: B1 [PASSED TAG] (**2026-08-28: T2 gate verified by Pro auditor**)
  · Files: `app/src/model/schema.ts` (chokepoint owner), `app/src/model/schema.test.ts` · Goal: Site/Location(recursive)/Rack(status enum `reserved|available|planned|active|deprecated`)/DeviceType metadata/Device basics (placement, `status` enum `planned|staged|active|offline|decommissioning|inventory|failed`, designation per ADR-0004 charset) + the `// netbox:`-or-`// extension:` citation meta-ratchet (ADR-0006) · Accept: zod round-trips; invalid status/charset RED; meta-ratchet RED on an uncited field. Brief: `prompts/Batch_004_F_W4.md`
* [DONE] B4b — F.W4b schema-components [SPLIT from B4]: component templates + materialized components + Cable + extension layer + DesignDocument · tier: T2 · dep: B4 [PASSED TAG] (**2026-08-28: T2 gate verified by Pro auditor**)
  · Files: same two (chokepoint — serialized behind B4) · Goal: Interface/FrontPort(+rear mapping)/RearPort/Console/Power templates + owned components (instantiate-then-own), Cable (2 terminations, status `planned|connected|decommissioning`), SignalClass + per-port signal/connector (three independent facts), `DesignDocument` with `schemaVersion`+`revision?` · Accept: third-termination RED, missing-rear-port RED, three-facts independence RED. Brief: `prompts/Batch_004b_F_W4b.md`
* [DONE] B5 — F.W5 es-reader: EasySchematic **format** reader (clean PORT-list port of `fraEasySchematic.js`) → schema · tier: T2 · dep: B4b [PASSED TAG] (**2026-08-28: T2 gate verified. FAILED TAG initially due to auxiliaryData omission; escalated to Pro, verified fix manually and merged.**)
  · Files: `app/src/exchange/easyschematic/read.ts` + test + 2 fixture sheets under `app/tests/fixtures/av-fasit/` · Goal: read a real sheet into the Copper document model, lossy fields reported not dropped silently · Accept: both fixtures parse; count assertions (devices/ports/cables) match hand-verified numbers. Brief: `prompts/Batch_005_F_W5.md`
* [PASSED TAG] B6 — F.W6 fixtures-rig: headless rig skeleton over all 15 sheets · tier: T2 · dep: B5 [NO TAG]
  · Files: `app/tests/fixtures/av-fasit/` (13 more sheets), `rig/run.mjs`, `rig/README.md` · Goal: `node rig/run.mjs` loads all 15 via B5, emits per-sheet counts + placeholder score JSON in <60s, no browser · Accept: 15/15 parsed; output schema pinned by test. Brief: `prompts/Batch_006_F_W6.md`

### Lane K — Catalog (devicetype-library + Bravo AV types, CC0)

* [PASSED TAG] B7 — K.W1 dtl-vendor: vendor devicetype-library subset + sync script · tier: T1 · dep: B1 [NO TAG]
  · Files: `catalog/devicetype-library/**` (vendored subset: Cisco, Netgear, Ubiquiti, APC, Eaton, Middle Atlantic, Yamaha, Blackmagic), `catalog/scripts/sync-dtl.mjs`, `catalog/README.md` (CC0 provenance note) · Goal: reproducible vendoring pinned to an upstream SHA · Accept: sync script idempotent; provenance recorded.
* [PASSED TAG] B8 — K.W2 dtl-parser: YAML → DeviceType parser · tier: T2 · dep: B4b,B7 [NO TAG]
  · Files: `catalog/src/parse.ts` + tests · Goal: parse interfaces/front-ports/rear-ports/console/power/module-bays/u_height/is_full_depth/weight/airflow into B4 DeviceType; unknown keys surfaced, not swallowed · Accept: 5 named real files parse with hand-checked assertions; malformed YAML RED.
* [PASSED TAG] B9 — K.W3 av-authoring-format: Bravo AV device-type format = DTL format + `copper_extensions` (per-port signal classes) · tier: T2 · dep: B8 [NO TAG]
  · Files: `catalog/bravo/README.md` (CC0 declaration), `catalog/schema/copper-extensions.schema.json`, `catalog/scripts/validate.mjs`, CI edit (chokepoint) · Goal: authoring format validated in CI; extensions layered so upstream contribution = strip extensions (ADR-0006 §6) · Accept: valid + invalid sample both proven.
* [PASSED TAG] B10 — K.W4 av-seed-set: 10 seed AV types (QSC, Extron, Crestron, Biamp, Shure, Sennheiser, Lightware, Kramer, Genelec, Barco — from datasheets, never from EasySchematic's catalogue) · tier: T1 (content; full-gate substitute) · dep: B9 [NO TAG]
  · Files: `catalog/bravo/*/*.yaml` · Accept: all pass `validate.mjs` + parse via B8; port counts spot-checked against public datasheets, sources cited in YAML comments.

### Lane NS — NCE seam (worktree `NCE-Copper`, branch `copper/*`, PR to NCE main · ⚠ ONE in flight at a time · every tool wave edits BOTH registries + the 5 count tests — see `docs/nce_seam_audit.md`)

> **⚠ LANE RE-SCOPED 2026-08-28 — HANDED TO THE ML ORCHESTRATOR.** Sindre is pushing `docs/m6_completion_guide.md` up front in the NCE ML queue; its waves M6.W13a–W20 cover B12–B18's scope (and more). NS rows below are `[HOLD-ML]`: at every Copper boot, content-verify (grep for the tool symbols on fresh NCE `main`, never ancestry) which completion waves landed; flip landed scope to `[DONE — delivered by ML <batch>, verified <sha>]` on the row; execute ONLY what ML has not adopted after Sindre confirms the handoff outcome. B11 (recon) stays Copper-owned — it is how the verification happens. Downstream deps read "B12" etc. as "B12's *scope* is on NCE main", whoever landed it.

* [DONE] B11 — NS.W1 seam-recon: baseline pinned to 30f1c27, tool counts 119/71 · tier: T1 · dep: — [NO TAG]
* [ADOPTED - ML m6-stack, content-verified 061dfb6] B12 — NS.W2 read-adapter: `system_design_get_topology(namespace_id, design_label, statuses?)` MCP tool + `GET /api/system-design/topology` REST · tier: T2 · dep: B11 [NO TAG]
  · Goal: promote the private `_fetch_*` queries (`validation_queries.py:373-553`) into one structured read (devices+ports+capabilities+edges+FL tree); namespace pinned in SQL per house pattern · Files: `nce/vertical_modules/system_design/{mcp_handlers,read}.py`, `nce/tool_registry.py`, `nce/mcp_stdio_tools.py`, `nce/admin_app.py`, `nce/admin_handlers/system_design.py`, + the 5 count tests · Accept: RED-first tenant-isolation proof through the owner pool; tool visible in `tools/list`. Brief: `prompts/Batch_012_NS_W2.md`
* [ADOPTED - ML m6-stack, content-verified 061dfb6] B13 — NS.W3 author-adapter: `system_design_author_topology` + `system_design_author_functional_location` MCP tools + POST routes wrapping the existing `do_author_*` (no domain changes) · tier: T3 · dep: B12 [NO TAG]
  · Accept: mutation=True flags; `assert_owner` path proven RED when ownership seeding removed (scratch copy); idempotent double-call proven. Brief: `prompts/Batch_013_NS_W3.md`
* [ADOPTED - ML m6-stack, content-verified 061dfb6] B14 — NS.W4 validate-adapter: `system_design_validate_design_graph` read tool + REST · tier: T2 · dep: B12 [NO TAG]
  · Accept: the 5 checks reachable externally; unknown-format warn semantics preserved. Brief: `prompts/Batch_014_NS_W4.md`
* [ADOPTED - ML m6-stack, content-verified 061dfb6] B15 — NS.W5 geometry-store: new FORCE-RLS table `system_design_geometry` (`namespace_id, node_label, x, y, rack_position NUMERIC(4,1), rack_face, meta JSONB`) + read/write folded into B12/B13 adapters · tier: T2 · dep: B13 [NO TAG]
  · Note: NetBox vocabulary for `position`/`face` (ADR-0006); migration number pre-allocated by orchestrator at dispatch (never self-picked — in-flight ML migrations own numbers).
* [ADOPTED - ML m6-stack, content-verified 061dfb6] B16 — NS.W6 cable-two-ended: fix `uses_cable` to link BOTH terminations (+ docstring), preserving existing rows · tier: T2 · dep: B13 [NO TAG]
  · Note: touches ML-owned module — flag the fix to the ML ledger owner on dispatch; RED-first traversal test.
* [ADOPTED - ML m6-stack, content-verified 061dfb6] B17 — NS.W7 status-lifecycle: ADR-0003 — `status` (NetBox vocab, default `planned`) on design objects in the side-table; reads filter by `statuses`; `DESIGN_REVISION` scoping for planned objects (client-side only; NCE stores inert text) · tier: T3 · dep: B15 [NO TAG]
* [ADOPTED - ML m6-stack, content-verified 061dfb6] B18 — NS.W8 delete-patch: design + implement removal of `planned` objects (nodes+edges+capability+geometry rows, event-logged); `active` deletion explicitly out of scope · tier: T3 · dep: B17 [NO TAG]

### Lane P — Projection (BFF + read-only canvas + the premise proof)

* [PASSED TAG] B19 — P.W1 bff-scaffold: `bff/` Hono TS server; config seams (`NCE_BASE_URL`, `NCE_API_KEY` via env/file — key class + blast radius per the seam audit; dev-identity seam per ADR-0011), `/healthz`, session stub (replaced by B75) · tier: T2 · dep: B1 [NO TAG]
* [PASSED TAG] B20 — P.W2 bff-nce-client: strictly typed REST client mapping NCE Graph to Copper schema, distinct errors for `-32005` (governance disabled) · tier: T2 · dep: B3,B4 [PASSED TAG]
* [PASSED TAG] B21 — P.W3 to-flow: pure `toFlow(document, layout)` projection (PORT-list port), `initialWidth/Height` seeding (steps-ai ADR 0021 trap) · tier: T2 · dep: B3,B4b [PASSED TAG]
* [PASSED TAG] B22 — P.W4 canvas-readonly: React Flow canvas; device cards with port rows, dual source+target handles per port, measure-on-mount · tier: T2 · dep: B21 [NO TAG]
* [PASSED TAG] B23 — P.W5 elk-layout: elkjs layered auto-layout for unpositioned designs (technique-level reuse, own code) · tier: T2 · dep: B21 [PASSED TAG]
* [PASSED TAG] B24 — P.W6 naive-edges: orthogonal-naive cable paths (no router; Q lane replaces) · tier: T2 · dep: B22 [NO TAG]
* [PASSED TAG] B25 — P.W7 cable-schedule: schedule view + CSV export from the same document · tier: T2 · dep: B20,B4b [NO TAG]
* [PASSED TAG] B26 — P.W8 integration-proof 🛑→HS-3: seed local NCE with the integration core stack (source: `Documents\integration-AV-Core` files + as-built sheets) via the B13-scope author tool, render read-only via B20–B24, cable schedule out; orchestrator runs the live stack itself · tier: T2 (run-it wave) · dep: B13,B20,B22,B23,B24,B25,B76 [NO TAG]
  · Accept (measurable, per the plan's own motto): (a) every seeded device/cable is representable without model workarounds, OR each failure is named on this row; (b) cable-schedule row count equals the seed count exactly; (c) initial render of the full site < 3 s locally; (d) screenshot + counts recorded here. HS-3 reviews the named-failures list, not a vibe.
* [DONE] B76 — P.W9 graph-doc-codec [ORCH-INSERTED, audit 2026-08-28]: the two pure mappings the lane silently assumed — NCE read shape → `DesignDocument`, and `DesignDocument` → author-tool payloads (component classes + front/rear mapping via the m6 guide Rev 2 §5 `extra` keys; geometry per Rev 2 §4 units) · tier: T2 · dep: B4b,B20 [NO TAG]
  · Accept: round-trip (document → author payload → simulated read shape → document) is identity on a two-device+plate fixture; unknown `extra` keys surfaced, not dropped.
* [PASSED TAG] B77 — P.W10 contract-pin-and-fixture-seam [ORCH-INSERTED, audit 2026-08-28]: contract-drift gate + recorded-fixture NCE stand-in — pins the m6 contract table (tool names, flags, REST paths, result shapes) as CI-run zod fixtures, plus a tiny fixture server letting P/E-lane waves develop while NS scope is `[HOLD-ML]`; orchestrator re-runs the pins against live NCE at every boot and NS adoption check · tier: T2 · dep: B20 [NO TAG]

### Lane G — Signal model (the extension Copper owns)

* [PASSED TAG] B27 — G.W1 signal-classes: SIGNAL_CLASSES port (clean, "our own" per steps-ai) + three-independent-facts port model (`type`/`signalType`/`connectorType` — 345-RJ45 lesson) · tier: T2 · dep: B4b [NO TAG]
* [PASSED TAG] B28 — G.W2 connector-accepts-rebuild: compatibility table from first principles (~50 rows) · tier: T3 (clean-room; brief bans the forbidden file by path) · dep: B27 [NO TAG]
* [PASSED TAG] B29 — G.W3 validate-join: two-axis validation → `direct|adapter|incompatible|unknown`; **confirm-warn, never reject** (a drawing is documentation) · tier: T2 · dep: B28 [NO TAG]
* [PASSED TAG] B30 — G.W4 port-overrides: `portsOf` chain with NetBox instantiate-then-own semantics · tier: T2 · dep: B4b,B8 [NO TAG]

### Lane E — Editing & writes (opens after HS-3)

* [PASSED TAG] B31 — E.W1 store: zustand document store, immutable updates, snapshot-stack undo, selectors · tier: T2 · dep: B26 [NO TAG]
  · Note: undo semantics vs write-through are decided HERE and stated in the brief — undo rewinds local document state; a write already sent to NCE is compensated by a new write (never a client-side "unsend"). B34 builds on that statement.
* [PASSED TAG] B32 — E.W2 palette: catalog browser + instantiate DeviceType→Device (components materialized per ADR-0006 §1) · tier: T2 · dep: B31,B8 [NO TAG]
* [PASSED TAG] B33 — E.W3 connect: connect gesture; three-state edge (dragging/sought/guessed); B29 wiring on drop · tier: T2 · dep: B31,B29 [NO TAG]
* [PASSED TAG] B34 — E.W4 write-through: save via BFF→B13-scope tools as `status=planned` with `actor` + `expected_version` (m6 guide Rev 2 §1–2); optimistic UI + conflict surfacing on version rejection · tier: T3 · dep: B31,B13,B15,B17,B75,B76 [NO TAG]
* [PASSED TAG] B35 — E.W5 promote: planned→active via `do_validate_design` verdicts + first `action_approval_queue` writer; human-confirm-only; the confirm dialog states AI-proposed vs human-decided with provenance (the B74 pattern, pulled forward here because promote ships first) · tier: T3 · dep: B34,B75 [NO TAG]

### Lane V — Validators (one standard = one microwave; client advisory now, NS server mirrors later)

* [PASSED TAG] B36 — V.W1 poe-budget: IEEE 802.3 af/at/bt class budget vs switch capacity · tier: T2 · dep: B30 [NO TAG]
* [PASSED TAG] B37 — V.W2 channel-length: EN 50173 / NEK 700 channel limits (TIA-568 as compatibility secondary; divergences documented — ADR-0008 §4) — refuses the 140 m run · tier: T2 · dep: B29 [NO TAG]
* [PASSED TAG] B38 — V.W3 rack-fit: u_height vs gap, is_full_depth collisions · tier: T2 · dep: B41 (transitively held via B41→B15 `[HOLD-ML]`) [NO TAG]
* [PASSED TAG] B39 — V.W4 port-occupancy: no second cable on an occupied termination · tier: T2 · dep: B33 (transitively held via B33 `[HOLD-HS3]`) [NO TAG]
* [PASSED TAG] B40 — V.W5 hdcp-chain: version-chain downgrade detection · tier: T2 · dep: B29 [NO TAG]

### Lane R — Racks & rooms

* [PASSED TAG] B41 — R.W1 rack-model: rack schema + U positions/face from B15 geometry · tier: T2 · dep: B4b,B15 [NO TAG]
* [PASSED TAG] B42 — R.W2 rack-elevation-view: U-positioned elevation rendering (net-new — no Romtegning prior art) · tier: T2 · dep: B41 [NO TAG]
* [PASSED TAG] B43 — R.W3 rack-edit: drag placement + B38 wiring · tier: T2 · dep: B42,B31 [NO TAG]
* [PASSED TAG] B44 — R.W4 location-tree: Site > Location(> Room) navigation mapped to FL labels · tier: T2 · dep: B4b,B20 [PASSED TAG]

### Lane Q — Routing quality (continuous track after B50; the four forbidden optimizations are pre-registered false wins)

* [PASSED TAG] B45 — Q.W1a router-core [SPLIT into B45/B45b, sizing audit 2026-08-28]: A* on uniform grid with direction-in-state + turn penalties, pure function, synthetic-fixture tests only · tier: T3 (clean-room; path bans in brief) · dep: B3 [NO TAG]
* [PASSED TAG] B45b — Q.W1b router-integration [SPLIT from B45]: U-turn multiplier + per-cable expansion budget + wiring into the canvas edge rendering (replaces B24's naive paths) · tier: T3 (clean-room; path bans in brief) · dep: B45,B24 [NO TAG]
* [PASSED TAG] B46 — Q.W2 penalty-zones: routed cables deposit cost; sequential routing becomes globally aware · tier: T3 (clean-room; path bans in brief) · dep: B45b [NO TAG]
* [PASSED TAG] B47 — Q.W3 bundling: trunk-follow discount + bundle proposals · tier: T3 (clean-room; path bans in brief) · dep: B46 [NO TAG]
* [PASSED TAG] B48 — Q.W4 quality-score: outside-in ugliness score, blind to router internals · tier: T3 (clean-room) · dep: B6,B45b [NO TAG]
* [PASSED TAG] B49 — Q.W5 portfolio-worker: route N strategies in a Web Worker, pick best by B48 · tier: T2 · dep: B47,B48 [NO TAG]
* [PASSED TAG] B50 — Q.W6 rig-ratchet: B48 scores across the 15 real sheets (using rig/run.mjs output or similar) to ensure total ugly-score is below FLOOR_SCORE. Fails with process.exit(1) if routing quality regresses. Wired into CI. · tier: T2 · dep: B48 [NO TAG]
* [DONE] B78 — Q.W7 visual-regression [ORCH-INSERTED, audit 2026-08-28]: Playwright (this wave installs it — ADR-0002 names it, nothing else adds it) screenshot tests of 3 fixture sheets on the read-only canvas, light + dark schemes · tier: T2 · dep: B24,B68 [NO TAG]

### Lane T — 3D (projections of the same document — steps-ai Rom3DView proves the shape)

* [PASSED TAG] B51 — T.W1 scene-from-design: three.js scene builder (rooms as volumes, racks/devices as dimensioned boxes) from (document, layout) · tier: T2 · dep: B23,B41 [NO TAG]
* [PASSED TAG] B52 — T.W2 room-walkthrough: camera controls, selection sync with canvas · tier: T2 · dep: B51 [NO TAG]
* [PASSED TAG] B53 — T.W3 gltf-export: glTF (+Collada if cheap) export with designations as node names · tier: T2 · dep: B51 [NO TAG]

### Lane X — Exchange doors

* [PASSED TAG] B54 — X.W1 dxf: DXF writer port (MIT — keep header) + plate/elevation export · tier: T2 · dep: B23 [PASSED TAG]
* [PASSED TAG] B55 — X.W2 es-import: EasySchematic-file → NCE (B5 reader + B13 author), one-shot with import report · tier: T3 · dep: B5,B34 [NO TAG]
* [PASSED TAG] B56 — X.W3 netbox-export: one-shot export (sites/locations/racks/device-types/devices/cables) — schema mapping is near-mechanical per ADR-0006 · tier: T3 · dep: B4b,B20 [NO TAG]
* [PASSED TAG] B57 — X.W4 netbox-import: one-shot import of an existing estate · tier: T3 · dep: B56 [NO TAG]
* [PASSED TAG] B58 — X.W5 d365-fl-import: FL hierarchy → Site/Location (supersedes the workbook path; `bravo_customerassetupload` defects noted in memory docs) · tier: T3 · dep: B44,B34 [NO TAG]

### Lane B — BOM (Contract A; greenfield in NCE per seam audit)

* [HOLD-HS5] B59 — B.W1 bom-contract: node-ownership row + label scheme (no `_`/`%` — LIKE-wildcard bug class) + status-edge writer design — **coordinate with the ML orchestrator (NCE ML-B132a/133b territory) before any dispatch** · tier: T3 · dep: B35 [NO TAG]
* [HOLD-HS5] B60 — B.W2 bom-emit: design→BOM_LINE emission with per-line provenance (design-generated origination path); delta emission on revision · tier: T3 · dep: B59 [NO TAG]

### Lane W — CAD/BIM workflows (plugins are ordinary API clients)

* [DONE] B61 — W.W1 cad-recon: verify, with sources, the actual exchange surfaces: Vectorworks plugin runtime (embedded Python/VectorScript/SDK), ConnectCAD device+circuit import/export formats, Revit IFC/Dynamo entry points, SketchUp import formats (glTF/DAE) — findings → `docs/cad_interop.md` · tier: T2 (research feeding a funding one-way door: fresh-session verification pass over the cited sources before HS-7) · dep: — [NO TAG]
* [PASSED TAG] B62 — W.W2 ifc-cobie-export: IFC (+COBie sheet) carrying reference designations (ADR-0004 decided first) · tier: T2 · dep: B44 [NO TAG]
* [PASSED TAG] B63 — W.W3 vw-plugin-mvp: Vectorworks plugin (embedded Python) pulling device/cable/rack schedules from the BFF API into the drawing · tier: T3 · dep: B61,B20 [NO TAG]
* [PASSED TAG] B64 — W.W4 connectcad-mapping: schema map ConnectCAD device/circuit ↔ Copper model (the NetBox treatment); one-shot circuit import · tier: T2 · dep: B61 [NO TAG]
* [HOLD-HS7] B65 — W.W5 sketchup-path: glTF/DAE handoff validated in real SketchUp; metadata survival checked · tier: T2 · dep: B53 [NO TAG]
* [PASSED TAG] B66 — W.W6 revit-dynamo-path: Dynamo script consuming the BFF API (shared parameters carry designations) · tier: T2 · dep: B62 [NO TAG]
* [PASSED TAG] B67 — W.W7 vw-placement-writeback: plugin pushes placed positions back (writes as `planned` through B34's path — same fact, same store) · tier: T3 · dep: B63,B34 [NO TAG]

### Lane U — Shell & platform (ADR-0007/0008 — a11y and i18n are wave-one ratchets, not retrofits)

* [DONE] B68 — U.W1a m3-tokens [SPLIT into B68/B68b, sizing audit 2026-08-28]: **M3 token foundation (ADR-0009)** — `@material/material-color-utilities` (Apache-2.0) generates light+dark schemes from seed `#B87333`, `color-scheme: light dark` + `prefers-color-scheme` (OS-following, no toggle), type/shape/elevation/state-layer tokens as CSS custom properties, both schemes in the initial CSS (no theme flash) · tier: T2 · dep: B1 [PASSED TAG] (**2026-08-28: T2 gate verified. FAILED TAG initially due to a git-base diffing artifact from the auditor; code verified clean manually and merged.**)
  · Note: all later surface waves consume tokens, never raw colors; domain palettes (signal classes, statuses) per ADR-0009 §5.
* [PASSED TAG] B68b — U.W1b app-shell [SPLIT from B68]: navigation + module-surface registry (router: react-router, MIT — per ADR-0002 amendment), session/tenancy context consuming B75's session, **i18n scaffold (i18next, MIT; nb-NO/en, all copy externalized)** · tier: T2 · dep: B68 [NO TAG]
* [PASSED TAG] B68c — U.W1c locale-context: Settings scaffolding and provider. Settings UI block. · tier: T2 · dep: B68b [NO TAG]
  · Note: the canvas becomes the first registered surface; shell owns routing chrome only — no business logic. Error-state conventions (loading/empty/error/retry, `-32005` rendering) are defined here as shared components and are acceptance-checked. Route params carry opaque ids only — no personal data in URLs (ADR-0008).
* [PASSED TAG] B69 — U.W2 a11y-ratchets: eslint a11y rules + axe smoke against the shell (Playwright arrives in B78; use axe over vitest+jsdom here or defer the smoke to B78 — state which) + keyboard-operability harness; EN 301 549/WCAG 2.1 AA acceptance wording added to `_TEMPLATE.md` **rule 5 (acceptance gate)** (one surgical edit) · tier: T2 · dep: B68b [NO TAG]
  · Note: the canvas's accessible *equivalent path* (schedules/tables/structured nav) is recorded as the compliance approach — honest, not pretended-AA-canvas.
* [DONE] B70 — U.W3 bff-module-proxy: generalized allowlisted proxy for NCE module route families (`/api/sales/*`, `/api/project/*`, …) with per-family enable flags; `-32005`/governance surfaced uniformly · tier: T3 (security surface) · dep: B20,B68b,B75 [NO TAG]
  · Accept (security): traversal + non-allowlisted-route denial + method-policy tests; per-session namespace validation on every proxied call; request size/rate limits; a bundle-scan ratchet proving `NCE_API_KEY` and the session-signing key never reach the client build.
* [HOLD-HS9] B75 — U.W4 auth-session [ORCH-INSERTED, audit 2026-08-28]: ADR-0011 — Entra ID OIDC (auth-code+PKCE, confidential client in the BFF), signed HttpOnly SameSite=Strict session cookie, Origin check on mutations, Entra-group→namespace mapping with server-side validation, `actor` (UPN) threaded to every NCE mutation, dev-identity seam for local/agent work · tier: T3 · dep: B19 [NO TAG]

### Lane M — Module surfaces (ADR-0007 — evidence-first; Portal prior art surveyed per the ADR-0005 method)

* [DONE] B71 — M.W0 surface-inventory 🛑→HS-8: two-sided verified inventory — (a) every NCE engine's reachable REST/MCP surface today (seam-audit method suite-wide, on fresh `main`), (b) every Portal screen in steps-ai worth learning from (quote spreadsheet/`lysning`, KatalogVelger product picker, customer/location trees, room-sign flow, recurring/finago steps) with PORT/PATTERN/ignore verdicts and the Portal capability each candidate surface would supersede · tier: T2 (research feeding a funding one-way door: fresh-session verification pass over the cited sources before HS-8) · dep: B68b [NO TAG]
* Per-surface waves (sales/quote, project, assets, inventory, netops dashboard, economy views): **UNSCHEDULED until HS-8** — each will carry: the NCE routes it consumes, the Portal screen verdicts it builds on, the FE-boundary statement (supersedes X / supersedes nothing), i18n + a11y acceptance criteria.

### Lane C — Compliance surfaces (ADR-0008 — post-HS-8 unless Sindre pulls them forward)

* [HOLD-HS8] B72 — C.W1 dsar-surface: wire NCE `me_app` DSAR/GDPR endpoints into the shell · tier: T2 · dep: B68b,B70 [NO TAG]
* [PASSED TAG] B73 — C.W2 provenance-viewer: C9a citations + event-log audit trail as first-class UI on any NCE-backed value · tier: T2 · dep: B70 [NO TAG]
* [PASSED TAG] B74 — C.W3 ai-transparency: Contract-B confirm dialogs (AI-proposed vs human-decided, provenance shown, confidence never presented as calibrated) as a shared shell component · tier: T3 · dep: B73 [NO TAG]

### Lane O — Observe (UNSCHEDULED — rows recorded, no briefs)

* Divergence overlay: Engine 18 capture vs design, greyed/flagged on the canvas — the thing no drawing tool on the market can do.
* RMM health overlay: Engine 19 state on the same device nodes; signal chain greys at the fault.

---

## Cross-cutting contracts (compressed — do not relitigate per wave)

- **Store (ADR-0001):** NCE only; no client-side design persistence; geometry/status live in Module 6 side-tables.
- **Contract A:** writes go through Module 6 owner tools; new node types register in `node-ownership.json` + per-namespace seed first; BOM_LINE ownership per HS-5.
- **Contract B:** promote, BOM emission, real NetBox/CAD writes, upstream PRs = human-confirm-first, idempotent, audited. No autonomy anywhere in this plan.
- **Contract C (licence):** ADR-0005 lists; CI gate + audit lens; no exception below Sindre.
- **Contract N (ADR-0006):** NetBox object model + status vocabulary + front/rear path semantics binding; every schema field cites source or declares `extension`.
- **Identifiers (ADR-0004):** derived, never typed; charset excludes `_ % space`.
- **Measured quality:** routing/layout changes prove themselves on the 15-sheet rig; the four forbidden optimizations are pre-registered false wins.

## Change log

- 2026-08-28 (audit remediation) — **Two-agent adversarial audit of all docs adjudicated; ~50 findings fixed.** Highlights: forbidden-source scan re-scoped to code trees (it RED'd on its own documentation); licence-firewall rule made satisfiable (FORBIDDEN paths allowed only inside do-not-open prohibitions); **elkjs is EPL-2.0, not MIT → ADR-0010 exception**; identity/session/tenancy hole → ADR-0011 (HS-9) + B75; deployment posture → ADR-0012; graph↔document codec + contract-drift gate + fixture seam → B76/B77; visual regression → B78; sizing splits B4/B4b, B45/B45b, B68/B68b; B46/B47 raised to T3 clean-room; B61/B71 raised to T2; geometry invariant fixed (`PORT_ROW_H = 2×PITCH`); "five node types" corrected to eight; m6 guide Rev 2 (actor, version token, cache-invalidation acceptance, cable columns, units, port-class extra-keys, tracing named out-of-scope); status enums pinned incl. `failed` + rack vocabulary; merge authority clarified (orchestrator merges Copper wave branches; Sindre gates NCE/tags/outward); BOOT_PROMPT refreshed. **Totals now: 81 waves · 17 lanes + O · 9 HARD-STOPs.** GUI: ADR-0009 Material Design 3, OS-following dark/light, copper seed.
- 2026-08-28 (later) — **Scope broadened + NS lane handed to ML.** Sindre's directives: (1) Copper = front end for the whole vertical suite, tech-is-the-business, EU/Nordic shaped → ADR-0007/0008, new lanes U (shell/i18n/a11y), M (module surfaces, two-sided inventory incl. Portal prior art), C (compliance surfaces), HS-8; B37 re-scoped to EN 50173/NEK 700 primary. (2) Module 6 completion handed to the NCE ML orchestrator via `docs/m6_completion_guide.md` (Sindre pushes it up front); NS rows B12–B18 → `[HOLD-ML]`/`[HOLD-ML+HS]`, adoption content-verified at every Copper boot.
- 2026-08-28 — **Ledger authored.** 67 waves across 13 lanes + unscheduled O lane; 7 HARD-STOPs. Grounded in: the NCE seam audit (Module 6 surface hole confirmed unfunded in ML's 231-wave plan — Copper pays), the steps-ai Romtegning survey (PORT/PATTERN/FORBIDDEN lists → ADR-0005), the ML.md house-style extraction, and Sindre's directives this session: NetBox methodology binding (ADR-0006), 3D lane (T), CAD/BIM lane (W — Revit/SketchUp/Vectorworks + VW plugins), private repo, NCE docsify tooling. Briefs pre-authored for B1–B6 and B12–B14; the orchestrator authors the rest at dispatch from rows (anti-rot deviation from ML practice, per NCE §7.6/§7.8 incidents).
- 2026-08-29 (orchestrator handoff) - **Ledger reconciled to tree** after Gemini-to-Claude handoff. B7, B9, B10, B25 falsely marked as passed by previous run without delivery — reset to [LOCKED]. B50 intent restored and reset to [LOCKED]. B6 rig merged (83f56a9), passing, and flipped to [PASSED TAG]. e2e test imports fixed.
