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
3. **Status vocabulary:** `[DONE]` · `[RUNNING]` · `[LOCKED]` · `[HOLD-HS{n}]` (waiting on a named HARD-STOP). TAG: `[NO TAG]` → `[WAITING TAG]` → `[PASSED TAG]` / `[FAILED TAG]`. Markers: `[ORCH-INSERTED]`, `[SPLIT into Na/Nb]`, `KEEP` (recorded sizing verdict).
4. **Tiers recorded at dispatch** (T1/T2/T3 per `_ORCHESTRATOR.md` §6.1); escalate, never downgrade. Every T3 gets an independent reviewer.
5. **The licence firewall is absolute** (`_ORCHESTRATOR.md` §3, ADR-0005). Clean-room waves (B28, B45–B48) carry do-not-open path bans in their briefs.
6. **Sequencing = critical path, not numeric.** F ∥ K ∥ NS from boot; only ONE NS wave in flight at any time (shared-repo hazard). HARD-STOPs halt a lane, not the run.

Legend per row: `[STATE] B{N} — {Lane}.W{W} {slug}: {what} · tier: {T} · dep: {…} [TAG]` then an indented `Files/Goal/Accept` detail line — the orchestrator authors post-B14 briefs from these details + `_TEMPLATE.md` at dispatch time, verifying every citation against the tree.

## HARD-STOPs

| Gate | Blocks | Sindre decides |
|---|---|---|
| 🛑 HS-1 | B17 | ADR-0003 sign-off (status vocabulary + design revisions) |
| 🛑 HS-2 | B18 | Delete semantics (WORM/audit one-way door) |
| 🛑 HS-3 | B31+ (E lane) | Premise check on the Veidekke read-only proof (B26) |
| 🛑 HS-4 | B35 | Promote flow (first `action_approval_queue` writer) |
| 🛑 HS-5 | B59 | BOM_LINE: adopt-into-ML vs Copper-funded (cross-orchestrator coordination) |
| 🛑 HS-6 | B56/B57 | First NetBox export/import against a real instance |
| 🛑 HS-7 | B63+ | Which CAD integrations to fund, from B61's verified findings |

---

## State Registry

### Lane F — Foundations (`app/` scaffold, gates, model core)

* [LOCKED] B1 — F.W1 app-scaffold: pnpm + Vite + React 19 + TS strict app, eslint flat config, vitest, CI (lint/typecheck/test) · tier: T1 · dep: — [NO TAG]
  · Files: `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `app/**` (new), `.github/workflows/ci.yml`, `tsconfig*.json`, `eslint.config.js` · Goal: empty app builds, gates run green in CI, folder layout `app/src/{model,layout,editor,views,exchange,store}` exists with placeholder index · Accept: `pnpm lint && pnpm typecheck && pnpm vitest run` green locally and in Actions; `app/src/model/index.test.ts` trivially passes. Brief: `prompts/Batch_001_F_W1.md`
* [LOCKED] B2 — F.W2 licence-gate: licence-checker CI step + allowlist + forbidden-source scan · tier: T1 · dep: B1 [NO TAG]
  · Files: `scripts/check-licences.mjs`, `scripts/forbidden-sources.mjs`, `.github/workflows/ci.yml` (one edit — chokepoint), `docs/decisions/0005-…` (link only) · Goal: CI fails on any dep outside MIT/BSD/Apache/ISC/CC0 and greps the diffable tree for forbidden-source markers (EasySchematic paths, `banesok`/`rutekvalitet`/`connectorAccepts` identifiers, Norwegian routing vocabulary) · Accept: seeded violation fixture makes both scripts exit non-zero (RED shown); clean tree passes. Brief: `prompts/Batch_002_F_W2.md`
* [LOCKED] B3 — F.W3 geometry-core: pitch constants + multiples ratchet · tier: T2 · dep: B1 [NO TAG]
  · Files: `app/src/model/geometry.ts`, `app/src/model/geometry.test.ts` · Goal: single `PITCH`, card/header/row/port dims all exported and all multiples; one `PORT_DOT_INSET`; ratchet test iterates exports asserting `% PITCH === 0` · Accept: mutation (off-pitch dim) shown RED. Brief: `prompts/Batch_003_F_W3.md`
* [LOCKED] B4 — F.W4 schema-core: NetBox-shaped document model + zod · tier: T2 · dep: B1 [NO TAG]
  · Files: `app/src/model/schema.ts` (chokepoint owner), `app/src/model/schema.test.ts` · Goal: Site/Location/Rack/DeviceType(+component templates: Interface, FrontPort, RearPort, ConsolePort, PowerPort/Outlet, ModuleBay, DeviceBay)/Device(+owned components)/Cable(2 terminations)/status enums (NetBox vocab) + extension layer (SignalClass ref, per-port signal, designation field per ADR-0004 charset) + `schemaVersion` — every field commented with its NetBox source or `extension:` tag (ADR-0006) · Accept: zod round-trip tests; invalid status/charset RED. Brief: `prompts/Batch_004_F_W4.md`
* [LOCKED] B5 — F.W5 es-reader: EasySchematic **format** reader (clean PORT-list port of `fraEasySchematic.js`) → schema · tier: T2 · dep: B4 [NO TAG]
  · Files: `app/src/exchange/easyschematic/read.ts` + test + 2 fixture sheets under `app/tests/fixtures/av-fasit/` · Goal: read a real sheet into the Copper document model, lossy fields reported not dropped silently · Accept: both fixtures parse; count assertions (devices/ports/cables) match hand-verified numbers. Brief: `prompts/Batch_005_F_W5.md`
* [LOCKED] B6 — F.W6 fixtures-rig: headless rig skeleton over all 15 sheets · tier: T2 · dep: B5 [NO TAG]
  · Files: `app/tests/fixtures/av-fasit/` (13 more sheets), `rig/run.mjs`, `rig/README.md` · Goal: `node rig/run.mjs` loads all 15 via B5, emits per-sheet counts + placeholder score JSON in <60s, no browser · Accept: 15/15 parsed; output schema pinned by test. Brief: `prompts/Batch_006_F_W6.md`

### Lane K — Catalog (devicetype-library + Bravo AV types, CC0)

* [LOCKED] B7 — K.W1 dtl-vendor: vendor devicetype-library subset + sync script · tier: T1 · dep: B1 [NO TAG]
  · Files: `catalog/devicetype-library/**` (vendored subset: Cisco, Netgear, Ubiquiti, APC, Eaton, Middle Atlantic, Yamaha, Blackmagic), `catalog/scripts/sync-dtl.mjs`, `catalog/README.md` (CC0 provenance note) · Goal: reproducible vendoring pinned to an upstream SHA · Accept: sync script idempotent; provenance recorded.
* [LOCKED] B8 — K.W2 dtl-parser: YAML → DeviceType parser · tier: T2 · dep: B4,B7 [NO TAG]
  · Files: `catalog/src/parse.ts` + tests · Goal: parse interfaces/front-ports/rear-ports/console/power/module-bays/u_height/is_full_depth/weight/airflow into B4 DeviceType; unknown keys surfaced, not swallowed · Accept: 5 named real files parse with hand-checked assertions; malformed YAML RED.
* [LOCKED] B9 — K.W3 av-authoring-format: Bravo AV device-type format = DTL format + `copper_extensions` (per-port signal classes) · tier: T2 · dep: B8 [NO TAG]
  · Files: `catalog/bravo/README.md` (CC0 declaration), `catalog/schema/copper-extensions.schema.json`, `catalog/scripts/validate.mjs`, CI edit (chokepoint) · Goal: authoring format validated in CI; extensions layered so upstream contribution = strip extensions (ADR-0006 §6) · Accept: valid + invalid sample both proven.
* [LOCKED] B10 — K.W4 av-seed-set: 10 seed AV types (QSC, Extron, Crestron, Biamp, Shure, Sennheiser, Lightware, Kramer, Genelec, Barco — from datasheets, never from EasySchematic's catalogue) · tier: T1 (content; full-gate substitute) · dep: B9 [NO TAG]
  · Files: `catalog/bravo/*/*.yaml` · Accept: all pass `validate.mjs` + parse via B8; port counts spot-checked against public datasheets, sources cited in YAML comments.

### Lane NS — NCE seam (worktree `NCE-Copper`, branch `copper/*`, PR to NCE main · ⚠ ONE in flight at a time · every tool wave edits BOTH registries + the 5 count tests — see `docs/nce_seam_audit.md`)

* [LOCKED] B11 — NS.W1 seam-recon: re-verify the 2026-08-28 seam audit against current NCE `main`; record baseline (env-pinned) + tool counts on this row; refresh `docs/nce_seam_audit.md` · tier: T1 (orchestrator-assisted, read-only) · dep: — [NO TAG]
* [LOCKED] B12 — NS.W2 read-adapter: `system_design_get_topology(namespace_id, design_label, statuses?)` MCP tool + `GET /api/system-design/topology` REST · tier: T2 · dep: B11 [NO TAG]
  · Goal: promote the private `_fetch_*` queries (`validation_queries.py:373-553`) into one structured read (devices+ports+capabilities+edges+FL tree); namespace pinned in SQL per house pattern · Files: `nce/vertical_modules/system_design/{mcp_handlers,read}.py`, `nce/tool_registry.py`, `nce/mcp_stdio_tools.py`, `nce/admin_app.py`, `nce/admin_handlers/system_design.py`, + the 5 count tests · Accept: RED-first tenant-isolation proof through the owner pool; tool visible in `tools/list`. Brief: `prompts/Batch_012_NS_W2.md`
* [LOCKED] B13 — NS.W3 author-adapter: `system_design_author_topology` + `system_design_author_functional_location` MCP tools + POST routes wrapping the existing `do_author_*` (no domain changes) · tier: T3 · dep: B12 [NO TAG]
  · Accept: mutation=True flags; `assert_owner` path proven RED when ownership seeding removed (scratch copy); idempotent double-call proven. Brief: `prompts/Batch_013_NS_W3.md`
* [LOCKED] B14 — NS.W4 validate-adapter: `system_design_validate_design_graph` read tool + REST · tier: T2 · dep: B12 [NO TAG]
  · Accept: the 5 checks reachable externally; unknown-format warn semantics preserved. Brief: `prompts/Batch_014_NS_W4.md`
* [LOCKED] B15 — NS.W5 geometry-store: new FORCE-RLS table `system_design_geometry` (`namespace_id, node_label, x, y, rack_position NUMERIC(4,1), rack_face, meta JSONB`) + read/write folded into B12/B13 adapters · tier: T2 · dep: B13 [NO TAG]
  · Note: NetBox vocabulary for `position`/`face` (ADR-0006); migration number pre-allocated by orchestrator at dispatch (never self-picked — in-flight ML migrations own numbers).
* [LOCKED] B16 — NS.W6 cable-two-ended: fix `uses_cable` to link BOTH terminations (+ docstring), preserving existing rows · tier: T2 · dep: B13 [NO TAG]
  · Note: touches ML-owned module — flag the fix to the ML ledger owner on dispatch; RED-first traversal test.
* [HOLD-HS1] B17 — NS.W7 status-lifecycle: ADR-0003 — `status` (NetBox vocab, default `planned`) on design objects in the side-table; reads filter by `statuses`; `DESIGN_REVISION` scoping for planned objects · tier: T3 · dep: B15 [NO TAG]
* [HOLD-HS2] B18 — NS.W8 delete-patch: design + implement removal of `planned` objects (nodes+edges+capability+geometry rows, event-logged); `active` deletion explicitly out of scope · tier: T3 · dep: B17 [NO TAG]

### Lane P — Projection (BFF + read-only canvas + the premise proof)

* [LOCKED] B19 — P.W1 bff-scaffold: `bff/` Hono TS server; config seams (`NCE_BASE_URL`, `NCE_API_KEY` via env/file), `/healthz`, session stub · tier: T2 · dep: B1 [NO TAG]
* [LOCKED] B20 — P.W2 bff-nce-client: HMAC client (`X-NCE-Timestamp` + canonical `METHOD\nPATH\nTIMESTAMP[\nSHA256(body)]`) + typed zod-parsed calls to B12/B14 routes; `-32005` (governance-disabled) surfaced as distinct state · tier: T2 · dep: B12,B19 [NO TAG]
* [LOCKED] B21 — P.W3 to-flow: pure `toFlow(document, layout)` projection (PORT-list port), `initialWidth/Height` seeding (steps-ai ADR 0021 trap) · tier: T2 · dep: B3,B4 [NO TAG]
* [LOCKED] B22 — P.W4 canvas-readonly: React Flow canvas; device cards with port rows, dual source+target handles per port, measure-on-mount · tier: T2 · dep: B21 [NO TAG]
* [LOCKED] B23 — P.W5 elk-layout: elkjs layered auto-layout for unpositioned designs (technique-level reuse, own code) · tier: T2 · dep: B21 [NO TAG]
* [LOCKED] B24 — P.W6 naive-edges: orthogonal-naive cable paths (no router; Q lane replaces) · tier: T2 · dep: B22 [NO TAG]
* [LOCKED] B25 — P.W7 cable-schedule: schedule view + CSV export from the same document · tier: T2 · dep: B20,B4 [NO TAG]
* [LOCKED] B26 — P.W8 veidekke-proof 🛑→HS-3: seed local NCE with the Veidekke core stack via B13, render read-only via B20–B24, cable schedule out; orchestrator runs the live stack itself; screenshot + counts recorded on this row · tier: T2 (run-it wave) · dep: B13,B20,B22,B23,B24,B25 [NO TAG]

### Lane G — Signal model (the extension Copper owns)

* [LOCKED] B27 — G.W1 signal-classes: SIGNAL_CLASSES port (clean, "our own" per steps-ai) + three-independent-facts port model (`type`/`signalType`/`connectorType` — 345-RJ45 lesson) · tier: T2 · dep: B4 [NO TAG]
* [LOCKED] B28 — G.W2 connector-accepts-rebuild: compatibility table from first principles (~50 rows) · tier: T3 (clean-room; brief bans the forbidden file by path) · dep: B27 [NO TAG]
* [LOCKED] B29 — G.W3 validate-join: two-axis validation → `direct|adapter|incompatible|unknown`; **confirm-warn, never reject** (a drawing is documentation) · tier: T2 · dep: B28 [NO TAG]
* [LOCKED] B30 — G.W4 port-overrides: `portsOf` chain with NetBox instantiate-then-own semantics · tier: T2 · dep: B4,B8 [NO TAG]

### Lane E — Editing & writes (opens after HS-3)

* [HOLD-HS3] B31 — E.W1 store: zustand document store, immutable updates, snapshot-stack undo, selectors · tier: T2 · dep: B26 [NO TAG]
* [HOLD-HS3] B32 — E.W2 palette: catalog browser + instantiate DeviceType→Device (components materialized per ADR-0006 §1) · tier: T2 · dep: B31,B8 [NO TAG]
* [HOLD-HS3] B33 — E.W3 connect: connect gesture; three-state edge (dragging/sought/guessed); B29 wiring on drop · tier: T2 · dep: B31,B29 [NO TAG]
* [HOLD-HS3] B34 — E.W4 write-through: save via BFF→B13 as `status=planned`; optimistic UI + conflict surfacing · tier: T3 · dep: B31,B13,B15,B17 [NO TAG]
* [HOLD-HS4] B35 — E.W5 promote: planned→active via `do_validate_design` verdicts + first `action_approval_queue` writer; human-confirm-only · tier: T3 · dep: B34 [NO TAG]

### Lane V — Validators (one standard = one microwave; client advisory now, NS server mirrors later)

* [LOCKED] B36 — V.W1 poe-budget: IEEE 802.3 af/at/bt class budget vs switch capacity · tier: T2 · dep: B30 [NO TAG]
* [LOCKED] B37 — V.W2 channel-length: TIA-568 channel refusal (the 140 m run) · tier: T2 · dep: B29 [NO TAG]
* [LOCKED] B38 — V.W3 rack-fit: u_height vs gap, is_full_depth collisions · tier: T2 · dep: B41 [NO TAG]
* [LOCKED] B39 — V.W4 port-occupancy: no second cable on an occupied termination · tier: T2 · dep: B33 [NO TAG]
* [LOCKED] B40 — V.W5 hdcp-chain: version-chain downgrade detection · tier: T2 · dep: B29 [NO TAG]

### Lane R — Racks & rooms

* [LOCKED] B41 — R.W1 rack-model: rack schema + U positions/face from B15 geometry · tier: T2 · dep: B4,B15 [NO TAG]
* [LOCKED] B42 — R.W2 rack-elevation-view: U-positioned elevation rendering (net-new — no Romtegning prior art) · tier: T2 · dep: B41 [NO TAG]
* [LOCKED] B43 — R.W3 rack-edit: drag placement + B38 wiring · tier: T2 · dep: B42,B31 [NO TAG]
* [LOCKED] B44 — R.W4 location-tree: Site→Location(→Room) navigation mapped to FL labels · tier: T2 · dep: B4,B20 [NO TAG]

### Lane Q — Routing quality (continuous track after B50; the four forbidden optimizations are pre-registered false wins)

* [LOCKED] B45 — Q.W1 router-v1: A* on uniform grid, direction-in-state, turn + U-turn penalties · tier: T3 (clean-room; path bans in brief) · dep: B24,B3 [NO TAG]
* [LOCKED] B46 — Q.W2 penalty-zones: routed cables deposit cost; sequential routing becomes globally aware · tier: T2 · dep: B45 [NO TAG]
* [LOCKED] B47 — Q.W3 bundling: trunk-follow discount + bundle proposals · tier: T2 · dep: B46 [NO TAG]
* [LOCKED] B48 — Q.W4 quality-score: outside-in ugliness score, blind to router internals · tier: T3 (clean-room) · dep: B6,B45 [NO TAG]
* [LOCKED] B49 — Q.W5 portfolio-worker: route N strategies in a Web Worker, pick best by B48 · tier: T2 · dep: B47,B48 [NO TAG]
* [LOCKED] B50 — Q.W6 rig-ratchet: B48 scores across the 15 sheets wired into CI with a floor; regressions fail the build · tier: T2 · dep: B48 [NO TAG]

### Lane T — 3D (projections of the same document — steps-ai Rom3DView proves the shape)

* [LOCKED] B51 — T.W1 scene-from-design: three.js scene builder (rooms as volumes, racks/devices as dimensioned boxes) from (document, layout) · tier: T2 · dep: B23,B41 [NO TAG]
* [LOCKED] B52 — T.W2 room-walkthrough: camera controls, selection sync with canvas · tier: T2 · dep: B51 [NO TAG]
* [LOCKED] B53 — T.W3 gltf-export: glTF (+Collada if cheap) export with designations as node names · tier: T2 · dep: B51 [NO TAG]

### Lane X — Exchange doors

* [LOCKED] B54 — X.W1 dxf: DXF writer port (MIT — keep header) + plate/elevation export · tier: T2 · dep: B23 [NO TAG]
* [LOCKED] B55 — X.W2 es-import: EasySchematic-file → NCE (B5 reader + B13 author), one-shot with import report · tier: T3 · dep: B5,B34 [NO TAG]
* [HOLD-HS6] B56 — X.W3 netbox-export: one-shot export (sites/locations/racks/device-types/devices/cables) — schema mapping is near-mechanical per ADR-0006 · tier: T3 · dep: B4,B20 [NO TAG]
* [HOLD-HS6] B57 — X.W4 netbox-import: one-shot import of an existing estate · tier: T3 · dep: B56 [NO TAG]
* [LOCKED] B58 — X.W5 d365-fl-import: FL hierarchy → Site/Location (supersedes the workbook path; `bravo_customerassetupload` defects noted in memory docs) · tier: T3 · dep: B44,B34 [NO TAG]

### Lane B — BOM (Contract A; greenfield in NCE per seam audit)

* [HOLD-HS5] B59 — B.W1 bom-contract: node-ownership row + label scheme (no `_`/`%` — LIKE-wildcard bug class) + status-edge writer design — **coordinate with ML (B132a/133b territory) before any dispatch** · tier: T3 · dep: B35 [NO TAG]
* [HOLD-HS5] B60 — B.W2 bom-emit: design→BOM_LINE emission with per-line provenance (design-generated origination path); delta emission on revision · tier: T3 · dep: B59 [NO TAG]

### Lane W — CAD/BIM workflows (plugins are ordinary API clients)

* [LOCKED] B61 — W.W1 cad-recon: verify, with sources, the actual exchange surfaces: Vectorworks plugin runtime (embedded Python/VectorScript/SDK), ConnectCAD device+circuit import/export formats, Revit IFC/Dynamo entry points, SketchUp import formats (glTF/DAE) — findings → `docs/cad_interop.md` · tier: T1 (research; no code) · dep: — [NO TAG]
* [HOLD-HS7] B62 — W.W2 ifc-cobie-export: IFC (+COBie sheet) carrying reference designations (ADR-0004 decided first) · tier: T2 · dep: B44 [NO TAG]
* [HOLD-HS7] B63 — W.W3 vw-plugin-mvp: Vectorworks plugin (embedded Python) pulling device/cable/rack schedules from the BFF API into the drawing · tier: T3 · dep: B61,B20 [NO TAG]
* [HOLD-HS7] B64 — W.W4 connectcad-mapping: schema map ConnectCAD device/circuit ↔ Copper model (the NetBox treatment); one-shot circuit import · tier: T2 · dep: B61 [NO TAG]
* [HOLD-HS7] B65 — W.W5 sketchup-path: glTF/DAE handoff validated in real SketchUp; metadata survival checked · tier: T2 · dep: B53 [NO TAG]
* [HOLD-HS7] B66 — W.W6 revit-dynamo-path: Dynamo script consuming the BFF API (shared parameters carry designations) · tier: T2 · dep: B62 [NO TAG]
* [HOLD-HS7] B67 — W.W7 vw-placement-writeback: plugin pushes placed positions back (writes as `planned` through B34's path — same fact, same store) · tier: T3 · dep: B63,B34 [NO TAG]

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

- 2026-08-28 — **Ledger authored.** 67 waves across 13 lanes + unscheduled O lane; 7 HARD-STOPs. Grounded in: the NCE seam audit (Module 6 surface hole confirmed unfunded in ML's 231-wave plan — Copper pays), the steps-ai Romtegning survey (PORT/PATTERN/FORBIDDEN lists → ADR-0005), the ML.md house-style extraction, and Sindre's directives this session: NetBox methodology binding (ADR-0006), 3D lane (T), CAD/BIM lane (W — Revit/SketchUp/Vectorworks + VW plugins), private repo, NCE docsify tooling. Briefs pre-authored for B1–B6 and B12–B14; the orchestrator authors the rest at dispatch from rows (anti-rot deviation from ML practice, per NCE §7.6/§7.8 incidents).
