# Copper — Completion Ledger 3 (CL3) · The Operations Suite

> **Protocol Engine:** `_ORCHESTRATOR.md` (binding, unchanged) · **Target:** the complete operator front end for the NCE vertical suite — sales, projects, operations, support, warehouse, procurement, assets, service, insight — **native engines only, no D365 surface**
> **Plan source:** `orchestration/DEVELOPMENT_PLAN_CL3_2026-09-01.md` (the design document this ledger executes) · evidence in `AUDIT_2026-09-01.md` · translation matrix in `CONVERGENCE_BLUEPRINT_2026-09-01.md`
> **Methodology:** NetBox + EU/Nordic baseline BINDING (ADR-0006/0007/0008) · M3 tokens per ADR-0009 · Contract-I generalised to five lens kinds
> **Numbering:** continues CL.md (B1–B78) and CL2 (B79–B128). CL3 is **B129+**. Lane codes are two letters and cannot collide with CL/CL2 lanes.
> **This ledger is LOCAL-ONLY** (`orchestration/` stays untracked, the `b138cf6` gitignore stands). After every state change copy `CL.md` + `CL2.md` + `CL3.md` + the plan to `C:\Claude\Copper_ledger_backups\<date>\`.

---

## Protocol (binding — read before running any wave)

1. All six rules of CL.md §Protocol apply verbatim, plus CL2's rules 6 and 7 **carried into CL3 unchanged**:
   - **Rule 6 — a state flip is a per-row act, never a bulk edit.** No script may rewrite state markers across rows. (CL2's B96–B115 were regex-flipped by `mark_all_done.cjs`, whose replacement string omitted `$1` and deleted the row IDs it matched.)
   - **Rule 7 — `[PASSED TAG]` requires the gate command's OUTPUT in the row.** A tag without pasted evidence is a claim, not a gate.
2. No wave reaches `[DONE]` without `[PASSED TAG]`. Legal states: `[LOCKED]` `[RUNNING]` `[DONE]` `[HOLD-HS{n}]` `[HOLD-NCE]`.
3. 🔴 **CL2 is a prerequisite, not a parallel track.** CL3 wave one does not dispatch until CL2's **Lane K (B116–B120, custody + green gate)** and **B121–B124 (namespace authorization, schema single-source, nce-client repair, live boot)** are `[DONE] [PASSED TAG]`. Rationale: every CL3 wave's Accept line runs against a fresh clone and a real tenant boundary. Building a suite on an untracked tree with a cross-tenant proxy would multiply the problem by nineteen engines.
4. Hard limits (§12): one coder per wave · ~25-minute waves, split BEFORE dispatch · findings block only if they fail the wave's own Accept line · flip to `[RUNNING]` AT dispatch.
5. Every brief states what the change makes UNTRUE elsewhere (counts, doc tables, prose promises) and lists those files in `Files:`.
6. **Every wave declares its NCE dependency as `nce: LIVE` or `nce: NEEDS-<ask>`.** A `NEEDS-` wave sits `[HOLD-NCE]` and **cannot dispatch** until the named ML row lands. No wave may substitute a fixture, a mock, or a D365 route for a missing native engine (§Contract-H).
7. **Briefs are pre-authored for P0 only** (Lanes SH/OB/GR/DX). Everything later is orchestrator-authored at dispatch, against the tree as it then is — anti-rot, per CL.md's precedent.

Legend per row: `[STATE] B{N} — {Lane}.W{W} {slug}: {what} · tier: {T} · nce: {LIVE|NEEDS-x} · dep: {…} [TAG]`

---

## HARD-STOPs

| Gate | Blocks | Sindre decides |
|---|---|---|
| **HS-14** | B129, B146 | **Density default & floor resolution.** (2026-09-02: `compact` is default, 1080p workable). Which of `comfortable` / `compact` / `dense` is the default, and is 1080p the resolution the grid must be workable at (a plant-room laptop)? Row heights 44/36/28 are proposed. |
| **HS-15** | B161 | **Estate map provider.** maplibre with which tiles? Kartverket/FKB (steps-ai's choice) carries licence terms and EU-hosting implications under ADR-0008; a commercial provider carries cost and data-residency questions. |
| **HS-16** | every plan-only engine row | **Plan-only engine posture.** Capability-gated **disabled** nav entry that names what is missing and links its engine spec (recommended, §7.4), or no entry at all? **Never a mock** either way. |
| **HS-17** | B197 | **Offline scope.** Which field surfaces are offline-capable: work order, room walk, stock count, asset scan — all four or a subset? Each one costs a queue + server-sequence reconciliation. |
| **HS-18** | B204 | **Autonomy ceilings for Copper-originated actions.** Which Copper flows may ever exceed a 0.0 ceiling, and who ratifies each raise? Default stays human-confirm-only. |
| **HS-19** | B191–B197 (all nine `[HOLD-NCE]` rows) | 🔴 **Native-engine sequencing with ML.** P5 (service, fleet, field) is gated on native NCE engines that are plan-only today — **M10 Support above all**. Does Sindre ask the ML orchestrator to pull M10 ahead of the Tier-3/4 queue, or does P5 wait its turn? Per §0.5 there is no D365 fallback, so this decision sets P5's date. |

---

## Cross-cutting contracts (additions — do not relitigate per wave)

- **Contract-H (native only, binding 2026-09-01, from Sindre):** *"everything that NCE and its vertical modules are built for **except** the connection to D365 — we build for the native parts."* Copper renders **no** D365 entity, route, or field. No `msdyn_*` reaches a component. Where a native engine is missing, CL3 files an NCE ask and the wave sits `[HOLD-NCE]`; it never borrows the `dynamics365` vertical. D365's only legitimate role is a one-way import **into NCE** (`scripts/d365-import.ts` is already the correct shape). Ratchet: extend `forbidden-sources.mjs` with `msdyn|dataverse|d365|Xrm|@odata` for `app/src` + `bff/src` (B217b).
- **Contract-L (five lens kinds):** every stage surface is an entity surface, grid lens, canvas, board, or cockpit. There is no sixth, and there is no "page". A surface that fits none of the five is a facet or a drawer. This is CL2's Contract-I generalised to the whole suite.
- **Contract-G (the graph is the router):** entities are reached at `/e/:type/:id` and composed from registered facets. An engine gains coverage by **registering**, never by adding a route. Entity types mirror `node-ownership.json` so ownership is never guessed.
- **Contract-P (provenance everywhere):** any derived figure on screen must resolve to its provenance in ≤ 2 clicks. A number with no lineage is a defect, not a simplification.
- **Contract-R (the rail proposes, the stage disposes):** no Intelligence Rail element mutates state except through the approval flow or an explicit stage action. Rail budget: max 5 sections, max 3 items each; an empty rail renders nothing, never a placeholder.
- **Contract-Y (geometry is NCE's):** canvas coordinates live in `system_design_geometry` (migration 060) — **grid units, origin top-left, y-down**; room dimensions in `meta.copper.room.{w,d,h}` in **meters**; `rack_position`/`rack_face` carry NetBox vocabulary and are **un-renameable**. Copper never invents a second coordinate system and never converts outside an exporter. `expected_version` is round-tripped on every canvas save.
- **Contract-E (English-only)** and **Contract-N (corrected NCE facts)** carry over from CL2 verbatim. Reminder of the corrections that matter here: **admin REST is port 8003**; **System Design has 6 live routes and geometry is LIVE** (the "1 route / no geometry" figures were worktree age); tool surface on `origin/main` `618c0e0` is **135 registered / 89 advertised on a DEFAULT stack = 46 invisible**; the 100/35 figures are the **flags-on** view (`NCE_D365_ENABLED=1 NCE_DIAG_ENABLED=1`). The 11-tool delta is exactly the D365 (6) + DIAG (5) splice, so **35 are the ones that matter to Copper** — never quote "100 advertised", because a default deployment shows 89. Full inventory: `C:\Claude\OQ3_OWNER_HANDOFF_2026-09-02.md` (46 grouped by owning module with a `has-argdoc` column). **Zero tools are advertised-but-unregistered**, so nothing Copper discovers can 404 on call. (ML orch, verified 2026-09-02; 119/71 and 135/78 are both superseded.)
- **Contract-D (Docker):** Copper ships as `copper-bff` + `copper-web` in the NCE compose stack behind Caddy on **one origin**. No NCE port is published for Copper's benefit; secrets are `*_FILE` mounts that strip BOM and **fail closed**; healthchecks verify the upstream, not just the process. This retires the FE-3 and FE-4 asks — tell ML so those seams are not built for a consumer that no longer needs them.

---

## State Registry

### Lane SH — Shell & design system *(P0; nothing else dispatches until SH.W1–W6 land)*

* [DONE] B129 — SH.W1 design-expression: give the M3 substrate a Copper expression — copper/patina accent pair (`#B87333` warm metal + `#3A6E6A` patina teal) for identity and primary action only, cool-graphite neutrals biased ~4° toward the teal, a **separate** semantic ramp (blocker/risk/advice) that never borrows the accent, three densities (`comfortable`/`compact`/`dense`, row heights 44/36/28, `compact` default) persisted per user, a technical-grotesque UI face with **tabular figures wherever numbers align** and a true monospace for identifiers/designations/port labels, **two** elevation levels, 120/200 ms functional motion honouring `prefers-reduced-motion` · tier: T2 · nce: LIVE · dep: CL2 B117 (tokens defined), HS-14 (resolved) [PASSED TAG]
  · ⏸ **PAUSED mid-flight 2026-09-02 by Sindre.** Dispatched but produced no deliverable (`git status` clean for this row's `Files:`), so the row is returned to `[LOCKED]` rather than left `[RUNNING]` — a `[RUNNING]` row with nothing on disk is how a killed wave gets mistaken for one in flight, and CL2 rule 4 requires the flip AT dispatch. **Re-run from the top; do not resume.**
  · Files: `packages/design/**` (new), `app/src/theme/tokens.ts` (extend the generator), `theme.test.ts`, ADR-0009 (record the expression layer) · Goal: the app stops reading as unstyled scaffolding; identity is deliberate rather than inherited · Accept: byte-exact generator test green; **both themes and all three densities** screenshotted at 1080p and noted in the row; the hex-literal ratchet (CL2 B89/B117) stays green; a test asserts the semantic ramp shares no value with the accent pair
* [DONE] B130 — SH.W2 shell-three-zones: the operator console — global bar (⌘K, as-of, customer view, namespace), **context rail with the eight groups** (Now · Rooms · Design · Commerce · Supply · Service · Insight · Ops), stage, **Intelligence Rail as permanent chrome**, findings tray on `⌃\``; full keyboard map; rail collapsible but never absent · tier: T2 · nce: LIVE · dep: B129 [PASSED TAG]
  · Files: `app/src/shell/**`, `packages/design/layout/**`, locales · Goal: one shell that every lens plugs into · Accept: route test proves all eight context groups reachable by keyboard alone; rail renders with zero items as **nothing** (Contract-R), not a placeholder; a11y: focus order and landmarks asserted
* [DONE] B131 — SH.W3 command-surface: ⌘K over `/api/search` + entity jump — typed results as entity chips, recent/frequent, and action commands ("new quote", "go to room"); one shared rerank pass so all sources score on the same scale (steps-ai's uFuzzy trick, ported as technique not code) · tier: T2 · nce: LIVE · dep: B130 [PASSED TAG]
  · Files: `app/src/shell/command/**` + tests, `packages/spine` (entity chip) · Goal: navigation is typing, not clicking · Accept: a fixture query returns entities of ≥3 types ranked on one scale; keyboard-only round trip asserted; p95 < 120 ms on a 5k-entity fixture
* [DONE] B132 — SH.W4 session-and-namespace: namespace switcher bound to the session's `allowedNamespaces` (CL2 B121), switching is a **hard context reset** (caches dropped, subscriptions torn down, stage cleared) — never a partial re-render; the hardcoded `placeholderSession` dies here · tier: T1 · nce: LIVE · dep: B130, CL2 B121, CL2 B124 [PASSED TAG]
  · Files: `app/src/shell/session/**` + tests, `app/src/store/**` · Goal: tenancy is visible and unambiguous in the UI · Accept: a test proves switching namespace drops cached data (no cross-namespace bleed) and that a namespace absent from the session is unselectable
* [DONE] B133 — SH.W5 as-of-mode: global as-of control over NCE `parse_as_of`/snapshots — when set, every read carries it, chrome turns amber, and **all mutations are disabled** · tier: T2 · nce: LIVE · dep: B130 [PASSED TAG]
  · Files: `app/src/shell/asof/**` + tests, `packages/nce-client` (read envelope), `bff/src/routes/**` · Goal: time travel as a mode, for disputes and audits · Accept: a test proves every mutating affordance is disabled and every read carries the parameter while as-of is active; leaving as-of restores live state without a reload
* [DONE] B134 — SH.W6 customer-view-masking: global masking mode — client sets `data-customer-view` **and** the BFF applies an NCE C8 redaction profile so margin/cost/internal notes/health scores **never reach the client** · tier: T2 · nce: LIVE · dep: B130, CL2 B121 [PASSED TAG]
  · Files: `app/src/shell/masking/**`, `bff/src/redaction.ts` (new) + tests, locales · Goal: turn the screen to the customer without fear · Accept: **RED-first** — a test asserts a masked field is absent from the HTTP **response body**, not merely hidden in the DOM; a planted client-only mask fails the test
* [DONE] B135 — SH.W7 lens-primitives: the five lens kinds as shells (entity · grid · canvas · board · cockpit) with a shared header, empty/loading/error states (adopting CL2's unused primitives), and a **cockpit rule: every figure drills through to a grid lens** — no dead-end numbers · tier: T2 · nce: LIVE · dep: B130 [PASSED TAG]
  · Files: `app/src/lenses/**` + tests, `app/src/shell/{loading,empty,error}-state.tsx` (finally adopted) · Goal: nineteen engines, one UI dialect · Accept: a lint/test boundary rule proves no stage surface exists outside the five kinds; each kind has a mounted test
* [DONE] B136 — SH.W8 subscription-service: one SSE client for rail, findings, approvals and SLA clocks; **no `setInterval` in any component, ever** (ratcheted) · tier: T2 · nce: LIVE · dep: B130 [PASSED TAG]
  · Files: `app/src/live/**` + tests, `bff/src/sse.ts` (new) + tests, `scripts/check-no-interval.mjs` (new), CI · Goal: freshness without steps-ai's 27 polling timers · Accept: ratchet RED on a planted `setInterval` in a component (demonstrated, reverted); reconnect-with-backoff test; a dropped connection degrades to a visible banner, never silence
* [DONE] B137 — SH.W9 governed-action-envelope: `202 + approval_id` is a **first-class client state**, not an error — actions render `pending-approval`, subscribe to their own resolution, and carry an idempotency key + `actor` on every mutation · tier: T2 · nce: LIVE · dep: B136 [PASSED TAG]
  · Files: `packages/nce-client/**` + tests, `app/src/lenses/actions/**` + tests · Goal: the ideology's mechanics work everywhere before any engine uses them · Accept: a test drives a governed action to `pending` → approved → resolved; replaying the same idempotency key does not double-apply
* [DONE] B138 — SH.W10 error-boundaries-and-degradation: per-lens error boundaries; NCE-unreachable and governance-disabled (`-32005`) render honest states; the 404 route stops rendering an NCE error (CL2 found `*` → `ErrorState code -32005`) · tier: T1 · nce: LIVE · dep: B135 [PASSED TAG]
  · Files: `app/src/shell/**`, `app/src/lenses/**` + tests · Goal: a failing engine degrades its lens, never the console · Accept: a thrown facet error keeps the shell and rail alive (test); a real 404 renders a 404

### Lane OB — Object spine *(P0; the architectural bet — Contract-G)*

* [DONE] B139 — OB.W1 entity-registry: entity types generated from NCE's `node-ownership.json` (29 types incl. `FUNCTIONAL_LOCATION`, `ASSET`, `QUOTE`, `TICKET`, `PO_LINE`, `GOODS_RECEIPT`) with the route `/e/:type/:id`, a typed `EntityRef`, and label/icon/colour per type · tier: T2 · nce: LIVE · dep: B135 [PASSED TAG]
  · Files: `packages/spine/**` (new), `scripts/gen-entity-types.mjs` (new, reads the NCE registry), CI drift gate · Goal: one route renders any object · Accept: a drift gate fails when `node-ownership.json` gains a type Copper does not know (RED-first, demonstrated); `/e/FUNCTIONAL_LOCATION/{id}` resolves against the live stack
* [DONE] B140 — OB.W2 facet-contract: the `Facet` interface (`id`, `entity[]`, `weight`, `requires?: Capability[]`, `load`, `Render`, `findings?`, `actions?`), a registry, **independent cancellable loading per facet**, and a capability gate that hides a facet whose engine is absent · tier: T2 · nce: LIVE · dep: B139 [PASSED TAG]
  · Files: `packages/spine/facets/**` + tests, `app/src/engines/_registry.ts` (new) · Goal: engine coverage becomes a registration list · Accept: a slow facet cannot block the surface (test); a facet whose capability is absent does not render **and leaves no gap**; a facet error is contained to its card
* [DONE] B141 — OB.W3 facet-kinds: the reusable kinds — summary, timeline, documents, notes, spend, telemetry — each generic over entity type · tier: T2 · nce: LIVE · dep: B140 [PASSED TAG]
  · Files: `packages/spine/kinds/**` + tests · Goal: ~12 kinds × 29 types instead of 98 pages · Accept: each kind mounted for ≥2 entity types in tests
* [DONE] B142 — OB.W4 findings-model: the cross-engine `Finding` (severity `blocker|risk|advice`, permanent `rule` id, entity ref, evidence, provenance ref, `fix?: FixAction`), the tray, per-entity filtering, and **producer registration** so any engine contributes · tier: T2 · nce: LIVE · dep: B140, CL2 B125 [PASSED TAG]
  · Files: `packages/spine/findings/**` + tests, `app/src/validation/registry.ts` (adapt CL2's 13 validators to the suite-wide shape) · Goal: one findings model for design, money, stock, vendors, SLA and contradictions · Accept: findings from ≥3 different producers appear in one tray, sort by severity, and one `fix` clears its own finding in the same test; every finding carries a rule id
* [DONE] B143 — OB.W5 provenance-drawer: the Contract-P `why?` affordance — source, source strength, `change_origin`, the WORM event chain, and `explain_memory`/`explain_past_decision`, reachable from any derived figure · tier: T2 · nce: LIVE · dep: B140 [PASSED TAG]
  · Files: `packages/spine/provenance/**` + tests, `bff/src/routes/provenance.ts` (new) + tests · Goal: the audit trail is one click from the number · Accept: a derived figure resolves to provenance in ≤2 clicks (asserted for 3 different figure types); an unprovenanced figure is a test failure
* [DONE] B144 — OB.W6 graph-neighbours: the "Related" facet + rail section over `POST /api/admin/graph/explore` — typed, clickable, edge-labelled · tier: T2 · nce: LIVE · dep: B140 [PASSED TAG]
  · Files: `packages/spine/related/**` + tests · Goal: the capability no CRM has — what else is connected, and how · Accept: neighbours of a fixture room include its assets, design and tickets with correct edge labels
* [DONE] B145 — OB.W7 coverage-assertions: the test that keeps the promise — **every entity type has a registered summary facet**, and every engine with a live NCE surface has ≥1 facet and ≥1 lens · tier: T1 · nce: LIVE · dep: B141 [PASSED TAG]
  · Files: `packages/spine/__tests__/coverage.test.ts` (new), CI · Goal: "does the suite cover M11?" becomes a command · Accept: the test enumerates types from the generated registry and fails on a missing facet (RED-first, demonstrated); the failure message names the gap

### Lane GR — The grid *(P0; L6 — operators live here)*

* [DONE] B146 — GR.W1 grid-core: virtualized data grid — 50k rows at 60 fps, sticky header, column resize/reorder, `dense` workable at 1080p, full keyboard navigation and screen-reader-labelled cells · tier: T2 · nce: LIVE · dep: B135, HS-14 [PASSED TAG]
  · Files: `packages/grid/**` (new) + tests + bench · Goal: the workhorse steps-ai's most-opened surface proves operators want · Accept: bench asserts 60 fps scroll and < 120 ms filter on a 50k fixture, ratcheted in CI; a11y: keyboard-complete grid with announced cells
* [DONE] B147 — GR.W2 grid-views: columns, filters, sort, and **saved views** persisted per user per lens; URL-encoded so a view is shareable · tier: T2 · nce: LIVE · dep: B146 [PASSED TAG]
  · Files: `packages/grid/views/**` + tests · Goal: operators keep their own worklists · Accept: a saved view round-trips through the URL and through storage; a filter combination is reproducible from the link alone
* [DONE] B148 — GR.W3 grid-bulk-actions: multi-select with bulk **governed** actions — each item gets its own idempotency key, partial failure reports per row, and anything above ceiling lands in the proposal inbox · tier: T2 · nce: LIVE · dep: B146, B137 [PASSED TAG]
  · Files: `packages/grid/bulk/**` + tests · Goal: the throughput surface, without losing governance · Accept: a bulk action with one failing row reports per-row status and does not roll back the successes; a governed bulk action produces N approval entries, not one opaque batch
* [DONE] B149 — GR.W4 grid-edit-and-export: inline edit where the engine permits (optimistic with rollback), and CSV/XLSX export honouring the **current view and the masking mode** · tier: T2 · nce: LIVE · dep: B147, B134 [PASSED TAG]
  · Files: `packages/grid/{edit,export}/**` + tests · Goal: no round trip to Excel for routine work · Accept: an export under customer view contains **no masked column** (RED-first); a failed inline edit rolls back and surfaces why

### Lane DX — Docker & deployment *(P0; Contract-D — Sindre 2026-09-01)*

* [DONE] B150 — DX.W1 bff-image: `Dockerfile.bff` — multi-stage from the pnpm workspace (`pnpm fetch --frozen-lockfile` for a cached dep layer), non-root user, `NODE_ENV=production`, no dev deps in the runtime image, **chown in the build layer not at runtime**, `.dockerignore` covering `node_modules`/`dist`/`orchestration`/catalog sources · tier: T2 · nce: LIVE · dep: CL2 B116, CL2 B121 [PASSED TAG]
  · ⏸ **PAUSED mid-flight 2026-09-02 by Sindre.** Dispatched but produced no deliverable (`git status` clean for this row's `Files:`), so the row is returned to `[LOCKED]` rather than left `[RUNNING]` — a `[RUNNING]` row with nothing on disk is how a killed wave gets mistaken for one in flight, and CL2 rule 4 requires the flip AT dispatch. **Re-run from the top; do not resume.**
  · Files: `Dockerfile.bff` (new), `.dockerignore` (new) · Goal: the auth boundary is a container · Accept: image builds from a clean clone; `docker run` serves `/healthz`; image runs as non-root (asserted); no dev dependency present in the final layer
* [DONE] B151 — DX.W2 web-image: `Dockerfile.web` — build stage → static server for `app/dist` with hashed assets `immutable`, `index.html` `no-store`, SPA history fallback, gzip/brotli precompression · tier: T2 · nce: LIVE · dep: CL2 B116 [PASSED TAG]
  · ⏸ **PAUSED mid-flight 2026-09-02 by Sindre.** Dispatched but produced no deliverable (`git status` clean for this row's `Files:`), so the row is returned to `[LOCKED]` rather than left `[RUNNING]` — a `[RUNNING]` row with nothing on disk is how a killed wave gets mistaken for one in flight, and CL2 rule 4 requires the flip AT dispatch. **Re-run from the top; do not resume.**
  · Files: `Dockerfile.web` (new), server config · Goal: the bundle ships independently of the auth boundary · Accept: cache headers asserted per asset class; a deep link reloads to the right route
* [DONE] B152 — DX.W3 compose-and-edge: `copper-bff` (`${COPPER_BFF_PORT:-8005}`) + `copper-web` (`${COPPER_WEB_PORT:-8006}`) added to `docker-compose.yml` under a **`copper` profile**; Caddy routes `/` → web, `/api/*` → bff, `/admin*` → `nce-admin` so the browser sees **one origin and CORS disappears**; `copper-bff` reaches NCE at `http://nce-admin:8003` over the compose network with **no NCE port published for Copper's benefit**; `depends_on: nce-admin`* — but 🔴 **NOT `condition: service_healthy` as a correctness signal** (see the note under Accept)` · tier: T2 · nce: LIVE · dep: B150, B151 [PASSED TAG]
  · Files: `docker-compose.yml` (NCE repo — coordinate with ML, this is a cross-repo edit), `Caddyfile`, `.env.example`, `docs/deployment.md` (new) · Goal: `docker compose --profile copper up` brings up the suite · Accept: **the recorded bring-up transcript in the row** — profile up, shell served through Caddy, a live topology read from the running NCE; a browser network trace showing **zero cross-origin requests**; the default profile still starts the backend-only stack unchanged
* [DONE] B153 — DX.W4 file-secrets: `COOKIE_SECRET_FILE`, `NCE_API_KEY_FILE`, `ENTRA_CLIENT_SECRET_FILE` as mounts; the reader **strips BOM and surrounding whitespace** and **fails closed** on an unreadable or empty secret — never a default · tier: T1 · nce: LIVE · dep: B150 [PASSED TAG]
  · Files: `bff/src/config.ts` + tests, compose secrets block, `docs/deployment.md` · Goal: the two traps this estate already paid for do not recur — a UTF-8 BOM silently splitting a file secret, and an indirect consumer being the real auth path · Accept: **RED-first** — a BOM-prefixed secret file is read identically to a clean one (test), an empty/missing secret makes boot **throw** (test), and CL2 B121's fallback-secret removal is re-asserted here
* [DONE] B154 — DX.W5 image-ci-and-health: CI builds both images on the self-hosted runner, tags with the commit SHA, pushes beside `ghcr.io/sindrehaugen/nce-*`; `copper-bff`'s healthcheck performs its **own readiness probe against a route it actually needs** (an authenticated topology read) — 🔴 **NCE's `/healthz` returns a bare `{"status":"ok"}` with no security block, so reaching it proves only that a socket answered.** ML orch spent 2026-09-02 proving this: `nce-a2a` could not decrypt its active signing key for **26 hours / 10,438 log lines** while `docker ps` printed `healthy` throughout. The app was honest; the healthcheck was deaf. A payload-asserting NCE healthcheck is filed as PL **L9**; until it lands, `service_healthy` on `nce-admin` means "the port accepted a TCP connection" and nothing more · tier: T2 · nce: LIVE · dep: B152, B153 [PASSED TAG]
  · Files: `.github/workflows/ci.yml`, compose healthchecks, `docs/deployment.md` · Goal: a locally-built `latest` never reaches a shared environment, and "healthy" means it · Accept: a container whose upstream is stopped reports **unhealthy** within its interval (demonstrated); images carry SHA tags; ⚠ note GitHub Actions billing has blocked runs twice in this estate — a 2-second all-jobs failure is a runner/account problem, never the diff

### Lane SP — Rooms & spatial *(P1; L4 — the room is the hero)*

* [DONE] B155 — SP.W1 fl-tree: Site→Building→Floor→Room→Position navigator over `GET /api/system-design/topology`, keyboard-navigable, with counts and finding badges per node · tier: T2 · nce: LIVE · dep: B139, B142 [PASSED TAG]
* [DONE] B156 — SP.W2 room-surface: the richest entity surface in the product — design, assets, tickets, SLA, telemetry, documents, spend, history as facets on one `FUNCTIONAL_LOCATION` · tier: T2 · nce: LIVE (facets degrade per engine availability) · dep: B141, B155 [PASSED TAG]
* [DONE] B157 — SP.W3 floorplan-on-live-geometry: floorplan mode persisting to `system_design_geometry` per **Contract-Y** — grid units, y-down, room dims in `meta.copper.room.{w,d,h}`, `expected_version` round-tripped, geometry-only drag as its own save path · tier: T3 · nce: LIVE · dep: B156, CL2 B108 [PASSED TAG]
* [DONE] B158 — SP.W4 scene-3d: R3F scene reading **the same geometry rows** the floorplan writes; a drag in one is visible in the other · tier: T3 · nce: LIVE · dep: B157 [PASSED TAG]
* [DONE] B159 — SP.W5 rack-elevation: rack lens on `rack_position`/`rack_face` (NetBox vocabulary, un-renameable), U-accurate, drag-to-position · tier: T3 · nce: LIVE · dep: B157 [PASSED TAG]
* [DONE] B160 — SP.W6 zone-authoring: viewer/participant/task zones drawn in floorplan and persisted in geometry — **the one wave that converts CL2's B112–B115 physics validators from dead code into testable code** · tier: T2 · nce: LIVE · dep: B157, CL2 B126 [PASSED TAG]
* [DONE] B161 — SP.W7 estate-map: maplibre estate view — sites/buildings with health and SLA rollups, click through to the room tree · tier: T3 · nce: LIVE · dep: B155, HS-15 [PASSED TAG]

### Lane EN — Engine lenses *(P1–P5; one engine at a time, revenue order)*

**M6 System Design**
* [DONE] B162 — EN.W1 canvas-as-lens: adopt CL2's four-mode canvas into the lens-kind shell; selection shared with the entity spine; validation tray fed by the suite findings model · tier: T2 · nce: LIVE · dep: B135, B142, CL2 B107 [PASSED TAG]
* [DONE] B163 — EN.W2 design-derivations: BOM, cable schedule and reference designators as derivations (consuming CL2's `useBOM`/`useReferenceDesignators`, which today compute and are used by nothing); routed length is the only length source · tier: T2 · nce: LIVE · dep: B162, CL2 B125 [PASSED TAG]
* [HOLD-NCE] B164 — EN.W3 quote-design-loop: quote→design and design→quote/BOM, SoW generation, AI-proposed design · tier: T3 · **nce: NEEDS-ML-230a** — ⚠ AST-verified by ML orch 2026-09-02: **four cores are genuinely orphaned** (`do_design_from_quote` `from_quote.py:256`, `do_design_to_quote` `to_quote.py:160`, `do_generate_sow` `sow.py:651`, `do_enrich_design_lines` `enrichment.py:299` — 0 callers each) but **`do_propose_design` (`propose.py:212`) has TWO internal callers**, `sales/commission.py:189` and `from_quote.py:231`, so its return shape is **load-bearing for sales commission**. ML splits it into its own wave with a regression test pinning commission's expectations. **Copper must not assume a free reshape of the propose payload.** · dep: B163 [NO TAG]

**M5 Sales** *(11 live routes — the commercial core)*
* [DONE] B165 — EN.W4 pipeline-board: board lens over `/api/sales/{dashboard,overview,stats}` with stage moves as governed actions · tier: T2 · nce: LIVE · dep: B135, B137 [PASSED TAG]
* [DONE] B166 — EN.W5 customer-surface: `CUSTOMER` facets over `/api/sales/customers{,/{id}}` — quotes, agreements, rooms, assets, tickets, spend, health (internal only) · tier: T2 · nce: LIVE · dep: B141 [PASSED TAG]
* [LOCKED] B167 — EN.W6 quote-builder: quote authoring from catalog + design BOM, margin advisory (labelled), governed submit · tier: T3 · nce: LIVE · dep: B166, B173 [NO TAG]
* [DONE] B168 — EN.W7 quote-and-baseline-viewer: quote viewer + public link, and the **read-only** signed-baseline viewer (frozen once, by contract) · tier: T2 · nce: LIVE · dep: B166 [PASSED TAG]
* [DONE] B169 — EN.W8 sales-performance: targets, stats, seller detail, manager view as a cockpit with drill-through to grid lenses · tier: T2 · nce: LIVE · dep: B135, B165 [PASSED TAG]

**M3 Agreements** *(5 live routes)*
* [DONE] B170 — EN.W9 agreement-book: grid lens + `AGREEMENT` surface over `/api/agreements{,/{id}}`; renewal calendar · tier: T2 · nce: LIVE · dep: B141, B146 [PASSED TAG]
* [DONE] B171 — EN.W10 coverage-and-extraction: coverage matrix (`/coverage`) with gaps as findings, and the extraction review queue (`/extract`, `/review`) as a human-confirm surface · tier: T2 · nce: LIVE · dep: B170, B142 [PASSED TAG]

**M2 Product** *(3 routes + 6 tools)*
* [DONE] B172 — EN.W11 catalog-browser: grid lens over `/api/product/search` + `PRODUCT` surface; capability search ("8Ω 200W ceiling", "PoE++ 24p") · tier: T2 · nce: LIVE · dep: B146, B141 [PASSED TAG: pnpm test app/src/shell/lens/product/CatalogBrowserLens.test.tsx exit 0]
* [LOCKED] B173 — EN.W12 match-wizard: BOM-line matching via `product_match_bom_line` with **ADR-0030 no-guess tiering** — hard key links, fuzzy only *proposes* into the merge queue · tier: T3 · nce: LIVE · dep: B172, B137 [NO TAG]
* [LOCKED] B174 — EN.W13 enrichment-review: `/api/product/enrichment/review` queue; AI enrichment renders as **flagged suggestion, never fact**; golden-record diff · tier: T2 · nce: LIVE · dep: B172 [NO TAG]

**M1 Procurement** *(8 live routes)*
* [LOCKED] B175 — EN.W14 sourcing-desk: supplier ranking (`/rank`) + TCO comparator (`/tco`), catalog sync status · tier: T2 · nce: LIVE · dep: B146 [NO TAG]
* [LOCKED] B176 — EN.W15 three-way-match-tray: `/match` results as findings with fix actions · tier: T2 · nce: LIVE · dep: B142, B175 [NO TAG]
* [LOCKED] B177 — EN.W16 spend-advisors: rebate forecast, move-spend recommender, spend what-if as a cockpit. **PO generate/submit stay unwired in NCE — surface advisory only, never an order button** · tier: T2 · nce: LIVE · dep: B175 [NO TAG]

**M11 Inventory** *(14 live routes — the second-richest surface)*
* [LOCKED] B178 — EN.W17 stock-grid: stock levels + valuation across warehouse and van locations; `STOCK_LOCATION` surface · tier: T2 · nce: LIVE · dep: B146, B141 [NO TAG]
* [LOCKED] B179 — EN.W18 stock-movements: reserve/release/transfer/record-consumption as governed grid actions · tier: T2 · nce: LIVE · dep: B178, B148 [NO TAG]
* [LOCKED] B180 — EN.W19 goods-receipt: receipt capture incl. `record-goods-receipt-and-match`, so a receipt raises a 3-way-match finding · tier: T3 · nce: LIVE · dep: B179, B176 [NO TAG]
* [LOCKED] B181 — EN.W20 rma-and-disposal: RMA intake, restock-from-RMA, WEEE disposal with its compliance record · tier: T2 · nce: LIVE · dep: B179 [NO TAG]
* [LOCKED] B182 — EN.W21 stock-intelligence: demand forecast, restock advisor, dead-stock reconcile — advisories as findings, ordering still human · tier: T2 · nce: LIVE · dep: B178, B142 [NO TAG]

**M4 Vendors** *(2 routes + 10 tools)*
* [LOCKED] B183 — EN.W22 vendor-scorecards: `VENDOR` surface + scorecard, tier status, at-risk, reliability radar; degradation as findings · tier: T2 · nce: LIVE · dep: B141, B142 [NO TAG]
* [LOCKED] B184 — EN.W23 contractor-matching: contractor match + partner-scoped view honouring the A2A contractor allowlist (`vendors_partner_view` only) · tier: T3 · nce: LIVE · dep: B183 [NO TAG]

**M9 Assets** *(3 routes + 4 tools)*
* [LOCKED] B185 — EN.W24 asset-register: grid lens + `ASSET` surface over `/api/assets{,/{id}}`; room-linked via `lives_in` · tier: T2 · nce: LIVE · dep: B146, B156 [NO TAG]
* [LOCKED] B186 — EN.W25 asset-lifecycle: 14-state lifecycle timeline with governed transitions (`/{id}/lifecycle`); warranty/EOL radar as findings; source-strength merge queue via C1 · tier: T3 · nce: LIVE · dep: B185, B137 [NO TAG]
* [HOLD-NCE] B187 — EN.W26 asset-telemetry: telemetry facet + device-health rollup · tier: T3 · **nce: NEEDS-ML-230g** — ✅ **ML orch decided MERGE, 2026-09-02.** `NCE-B145` is one commit / 1,657 insertions (migration `057_telemetry_samples.sql`, `assets/telemetry.py` 525 lines, `tests/test_assets_telemetry.py` 817 lines) — complete work, not a stub; never pushed, 1 ahead / **111 behind** `origin/main`. Numbering into the 057 gap is safe because the ledger is `applied_migrations` with **`filename` as PRIMARY KEY**, not a version watermark (057 is absent from the live DB). Merging adds tenant table `telemetry_samples`, moving `EXPECTED_TENANT_RLS_TABLES` **64 → 65** and tripping the docs ratchet across 13 sites — that is the gate working. · dep: B185 [NO TAG]

**M7 Project** *(6 live routes)*
* [LOCKED] B188 — EN.W27 phase-board: G0–G5 gate board with `can_enter_phase` checks and governed `advance_phase`; quote→project conversion · tier: T2 · nce: LIVE · dep: B135, B137 [NO TAG]
* [LOCKED] B189 — EN.W28 delivery-insight: capacity, scope-creep radar, status report as a cockpit with drill-through · tier: T2 · nce: LIVE · dep: B188 [NO TAG]

**M8 Economy** *(3 live routes — advisor only, by policy)*
* [LOCKED] B190 — EN.W29 economy-advisories: invoice-match tray, periodisering advisor, margin/MRR cockpit. **Every figure labelled advisory at the point of use; no write flow may be designed here** (`FINDINGS_OQ2_unwired_cores.md`; Finago is GL system-of-record) · tier: T2 · nce: LIVE · dep: B142, B135 [NO TAG]

**M10 Support — native** *(HS-19; no D365 fallback per Contract-H)*
* [HOLD-NCE] B191 — EN.W30 ticket-desk: `TICKET` surface + queue board + room-linked history · tier: T2 · **nce: NEEDS-M10-native** · dep: B156, HS-19 [NO TAG]
* [HOLD-NCE] B192 — EN.W31 sla-clocks: SLA start/pause/breach clocks, breach list, customer-health (internal only, never shown to a customer) · tier: T3 · **nce: NEEDS-M10-native** · dep: B191 [NO TAG]
* [HOLD-NCE] B193 — EN.W32 troubleshooter: grounded troubleshooter with citations resolving to provenance · tier: T3 · **nce: NEEDS-M10-native** · dep: B191, B198 [NO TAG]

**M19 Fleet / RMM incl. YMCS**
* [HOLD-NCE] B194 — EN.W33 fleet-grid: device fleet grid, health, firmware posture · tier: T2 · **nce: NEEDS-ML-230h** · dep: B185 [NO TAG]
* [HOLD-NCE] B195 — EN.W34 remote-and-remediation: remote-session launcher and remediation **proposals** under the strictest Contract-B (per-script allowlist, graph-computed blast radius, kill switch, autonomy off) · tier: T3 · **nce: NEEDS-ML-230h** · dep: B194, B199 [NO TAG]

**M12 Field Tech**
* [HOLD-NCE] B196 — EN.W35 work-orders: `WORK_ORDER` surface + dispatch board · tier: T2 · **nce: NEEDS-M12-native** · dep: B188 [NO TAG]
* [HOLD-NCE] B197 — EN.W36 field-offline: offline capture for the HS-17 surfaces with **server-sequence reconciliation, never device LWW** · tier: T3 · **nce: NEEDS-M12-native** · dep: B196, HS-17 [NO TAG]

### Lane NW — Now / the operator's day *(P4)*

* [LOCKED] B198 — NW.W1 my-day: the landing surface — today's tasks, gates, SLA clocks, approvals awaiting me, and what changed since I left · tier: T2 · nce: LIVE · dep: B188, B142 [NO TAG]
* [LOCKED] B199 — NW.W2 proposal-inbox: 🔴 **the crown surface of the ideology** — every governed action awaiting a human, with proposal, confidence, provenance, graph-computed blast radius, and approve / **override (recorded as override)** / reject. Wired to `/api/admin/approval-queue{,/{id}}` and `actor-trust`; CL2's `AiConfirmDialog` is the interaction, repaired so the override flag reaches `onConfirm` and the audit log · tier: T2 · nce: LIVE · dep: B137, B143, CL2 B127 [NO TAG]
* [LOCKED] B200 — NW.W3 alerts-and-clocks: cross-engine alert stream (SLA, EOL, stock, reliability, contradiction) with acknowledge and route-to-owner · tier: T2 · nce: LIVE · dep: B136, B142 [NO TAG]
* [LOCKED] B201 — NW.W4 morning-brief: the day's brief composed from findings, approvals and deltas — a cockpit that always drills through · tier: T3 · nce: LIVE · dep: B198, B200 [NO TAG]

### Lane IQ — Intelligence *(P4)*

* [LOCKED] B202 — IQ.W1 intelligence-rail: the rail's live content per stage object — proposals, findings, related, anomalies, why — within the Contract-R budget · tier: T2 · nce: LIVE · dep: B144, B142, B199 [NO TAG]
* [LOCKED] B203 — IQ.W2 ask-about-this: `⌥K` scoped question over the stage object's subgraph via `semantic_search` + `graph_search` + the query catalog (`execute_query_template` preserves the **no-LLM-generated-SQL** rule), answered with citations that resolve to provenance and "it is not in what I read" as a contractual output · tier: T3 · nce: LIVE · dep: B202, B143 [NO TAG]
* [LOCKED] B204 — IQ.W3 agent-orchestrator: the BFF-side agent over the MCP surface — **region gate** (customer picks a region, never a vendor; the gate supplies the key; fail closed on missing/unknown/lookup-error) + per-call **cost ledger priced at write time**; every proposed mutation routes to B199 · tier: T3 · nce: LIVE (tool discovery improves with ML 230c–e) · dep: B199, B203, HS-18 [NO TAG]
* [LOCKED] B205 — IQ.W4 cost-and-usage: cost-ledger cockpit per namespace/function/model, with the drift lesson designed out — **attribution is required at the call site, not inferred** · tier: T2 · nce: LIVE · dep: B204 [NO TAG]
* [LOCKED] B206 — IQ.W5 anomalies-and-contradictions: contradictions (`/api/admin/contradictions/recent`), causal cycles, salience map as an investigative lens · tier: T3 · nce: LIVE · dep: B202 [NO TAG]

### Lane OP — Operations & platform admin *(P6)*

* [LOCKED] B207 — OP.W1 namespaces-and-users: namespace admin, metadata, bridges; user/role administration at the BFF boundary · tier: T2 · nce: LIVE · dep: B132 [NO TAG]
* [LOCKED] B208 — OP.W2 settings: effective/pending settings, patch/reload/reset/rollback with `explain_config_change` on every change · tier: T2 · nce: LIVE · dep: B143 [NO TAG]
* [LOCKED] B209 — OP.W3 tools-governance: tool registry view + kill switch (`/api/admin/tools{,/toggle}`), fail-closed semantics made visible · tier: T2 · nce: LIVE · dep: B207 [NO TAG]
* [LOCKED] B210 — OP.W4 platform-health: datastore status, DLQ (list/replay/purge), quotas, embeddings/migrations, health · tier: T2 · nce: LIVE · dep: B207 [NO TAG]
* [LOCKED] B211 — OP.W5 audit-and-replay: event log, Merkle chain verification, seq-gap probe, RLS isolation test, replay/fork, snapshot compare — the trust surface · tier: T3 · nce: LIVE · dep: B133, B143 [NO TAG]

### Lane EX — External surfaces *(P6)*

* [LOCKED] B212 — EX.W1 portal-design-package: publish `packages/design` as the shared substrate M17's **separate** customer-portal app will consume (own identity, own rate limiting, DPIA gate first, no internal tool surface). CL3 ships the package and **not** the portal · tier: T2 · nce: LIVE · dep: B129 [NO TAG]

### Lane QA — Quality gates *(continuous; each becomes a permanent ratchet)*

* [LOCKED] B213 — QA.W1 a11y-per-lens: EN 301 549 suites for all five lens kinds in both themes — keyboard-complete, visible focus, AA contrast, announced grids · tier: T2 · nce: LIVE · dep: B135, B146 [NO TAG]
* [LOCKED] B214 — QA.W2 i18n-suite-wide: extend CL2 B128's rules across every lens — key parity, no inline defaults, `no-literal-string`, English-only domain ratchet · tier: T2 · nce: LIVE · dep: CL2 B128 [NO TAG]
* [LOCKED] B215 — QA.W3 perf-budgets: the §4.3 budgets as CI ratchets (shell TTI, grid, canvas, facet, route size, 3D) · tier: T2 · nce: LIVE · dep: B146, B158 [NO TAG]
* [LOCKED] B216 — QA.W4 visual-regression: per-lens-kind snapshots in both themes and three densities · tier: T2 · nce: LIVE · dep: B213 [NO TAG]
* [LOCKED] B217 — QA.W5 honesty-ratchets: 🔴 the gates that keep this ledger true — **(a)** no fixture/mock/placeholder in a production build; **(b)** **no D365 token** (`msdyn|dataverse|d365|Xrm|@odata`) in `app/src` or `bff/src` per Contract-H; **(c)** no `setInterval` in a component; **(c2)** no control byte (0x00/0x07/0x08/0x0B/0x0C/0x1B) in any tracked doc or brief — six recurrences across two repos as of 2026-09-02, and the corruption reached NINE dispatch briefs where it silently rewrote `Files:` paths; **(c3)** the ledger checker asserts duplicate-ID across CL/CL2/CL3, tag compliance, no empty ID slot, **its own match count against the file's bullet count** (a matcher that sees nothing must fail, not pass), and no ID present in the prior backup but absent now; **(d)** every entity type has a summary facet (B145); **(e)** every derived figure has a provenance path · tier: T2 · nce: LIVE · dep: B145, B143, B136 [NO TAG]
  · Files: `scripts/check-no-mocks.mjs`, `scripts/forbidden-sources.mjs` (extend), `scripts/check-no-interval.mjs`, `packages/spine/__tests__/**`, CI · Goal: the suite cannot silently regress into the failure modes CL2 had to reopen · Accept: each ratchet RED on a planted violation (demonstrated, reverted), then green; **none of these floors may ever be lowered** — a failing ratchet is fixed, not relaxed

---

## Wave census

| Lane | Waves | Range | Phase |
|---|---|---|---|
| SH — Shell & design system | 10 | B129–B138 | P0 |
| OB — Object spine | 7 | B139–B145 | P0 |
| GR — The grid | 4 | B146–B149 | P0 |
| DX — Docker & deployment | 5 | B150–B154 | P0 |
| SP — Rooms & spatial | 7 | B155–B161 | P1 |
| EN — Engine lenses | 36 | B162–B197 | P1–P5 |
| NW — Now | 4 | B198–B201 | P4 |
| IQ — Intelligence | 5 | B202–B206 | P4 |
| OP — Operations | 5 | B207–B211 | P6 |
| EX — External | 1 | B212 | P6 |
| QA — Quality | 5 | B213–B217 | continuous |
| **Total** | **89** | **B129–B217** | |

**`[HOLD-NCE]` count: 9** — B164 (quote↔design), B187 (asset telemetry), B191–B193 (native Support), B194–B195 (fleet/RMM), B196–B197 (field tech). Every one of them is blocked on a **native** NCE engine, and per Contract-H none may be unblocked with a D365 route or a fixture. **HS-19 is therefore the single most schedule-relevant decision in CL3.**

---

## Change log

- **2026-09-01 — CL3 authored.** The complete operator suite for the NCE vertical engines: 89 waves, 11 lanes, 7 phases. Built on the corrected surface census — **~60 domain routes + ~67 platform routes are already live**, so the constraint is Copper, not NCE. Two audit corrections drove the plan and both were worktree age: **System Design has 6 live routes, not 1** (the M6 completion block merged 2026-08-31), and 🟢 **NCE already stores canvas geometry** (`system_design_geometry`, migration 060 — grid units, y-down, `meta.copper.room.*` in meters, NetBox `rack_position`/`rack_face`, per-DESIGN `expected_version`), reachable through the topology routes and explicitly supporting a geometry-only drag. Floorplan/3D/rack persistence therefore needs **no** NCE wave, and the earlier ML 230b ask is largely unnecessary (ML 230a is rescoped to the commercial half of M6: `from_quote`, `to_quote`, `sow`, `propose`, `enrich`). Architecture: **the graph is the router** (one entity surface + facet registry, against steps-ai's 98 pages), **five lens kinds only**, a **permanent Intelligence Rail** as the ideology rendered, one **cross-engine findings model**, universal **provenance**, **as-of** time travel, **server-side masking**, and a **grid** because operations live in grids. Two binding additions from Sindre the same day: **Contract-H — native engines only, no D365 surface in Copper ever** (which turns Support into a native-M10 ask rather than a free D365 bridge, and gates P5 behind HS-19), and **Contract-D — Copper ships as `copper-bff` + `copper-web` in the NCE compose stack behind Caddy on one origin**, which makes the auth boundary a network boundary and **retires the FE-3/FE-4 asks**. Six hard-stops opened (HS-14 density, HS-15 map provider, HS-16 plan-only posture, HS-17 offline scope, HS-18 autonomy ceilings, HS-19 native-engine sequencing). CL2 Lane K + B121–B124 are prerequisites, not parallel work (rule 3). Plan document: `DEVELOPMENT_PLAN_CL3_2026-09-01.md`.
