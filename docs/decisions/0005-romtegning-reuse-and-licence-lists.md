# ADR-0005: What Copper takes from Romtegning — the PORT list, the PATTERN list, and the FORBIDDEN list

> **Status:** accepted · **Date:** 2026-08-28 · **Deciders:** Sindre

## Context

steps-ai's Romtegning (`frontend/src/lysning/romtegning/`) contains the closest prior art to Copper. Most of it is Bravo-owned and clean. **Three of its most valuable files are derived from ProjectSchema (AGPL-3.0)** — attributed in-file, and steps-ai's own `THIRD-PARTY-NOTICES.md` states the exposure plainly ("either the AGPL terms are fulfilled, or the file must be rewritten from scratch"). Copper is closed-source; AGPL-derived code cannot enter this repo in any form. Architecture and measured facts about the problem domain are not copyrightable; code expression is.

## Decision

Three lists. Wave briefs cite these lists; the licence gate (wave F.W2) enforces the spirit in CI.

### PORT list — take as code, translate to TypeScript, English identifiers (clean Bravo-owned or MIT)

| steps-ai file | What it is |
|---|---|
| `romtegning/model/geometry.js` | Grid pitch discipline, card/port geometry, `PORT_DOT_INSET` |
| `romtegning/model/ports.js` | `portsOf()` per-instance port override chain (device → product → catalog). Measured: 21 of 38 models have differing port sets between instances |
| `romtegning/model/connectors.js` | `SIGNAL_CLASSES` table — marked "our own" in-file |
| `romtegning/model/validate.js` | Two-axis (signal × plug) validation join, `direct/adapter/incompatible/unknown`, confirm-warn policy. **Its call into `connectorAccepts` is replaced by Copper's rebuilt table (G.W2)** |
| `romtegning/editor/toFlow.js` | Pure document→React-Flow projection (strip Bravo `data` fields) |
| `romtegning/model/persist.js` + `migrasjoner.js` | Versioned document schema + migration funnel (repurposed: Copper persists to NCE, not `av_drawings`) |
| `romtegning/model/dxfWriter.js` + `dxfExport.js` | **MIT (Synergy Codes) — keep the licence header** |
| `romtegning/model/fraProjectSchema.js` | ProjectSchema **format** reader — reads the format, no copied lines (states so in-file) |
| `frontend/tests/malerigg/` | Headless routing/layout quality rig harness |
| `frontend/tests/fixtures/av-fasit/*.projectschema.json` | 15 real anonymized customer sheets — Bravo data, the ground truth for the quality rig |
| `backend/steps_product/rackmontering.py` | Pattern + code: three-valued answers with `{value, source, rationale}` and human-wins precedence |

### PATTERN list — reimplement from the idea; do not port the code

- `romtegning/layout/banesok.js` — **AGPL-derived.** The algorithm *ideas* transfer: A* on a uniform grid with direction in the search state, turn penalties, U-turn multiplier, penalty zones deposited by already-routed cables, bundle-follow discount, per-cable expansion budget. The Copper router (Q.W1–Q.W3) is written from this description, in this repo, without opening that file.
- `romtegning/layout/rutekvalitet.js` — **AGPL-derived.** Adopt the idea: an outside-in "ugliness score" that cannot see the router's internal rules, so it cannot confirm itself.
- `romtegning/model/connectorAccepts.js` — **AGPL-derived.** Rebuild the connector-compatibility table (~50 rows) from first-principles AV/IT knowledge; the facts (USB-A→USB-B is a cable, not an adapter) are nobody's property, the table expression is.
- `romtegning/layout/elkLayout.js` — Bravo-owned but coupled to Portal room semantics; take the ELK-per-zone technique, not the file.
- `romtegning/editor/CableEdge.jsx` three-state edge, `measureOnMount` + dimension seeding, dual source+target handles per port — take the patterns.
- Domain lessons carried as recorded knowledge: the **four forbidden routing optimizations** (finer grid, half-pitch lanes, nesting bias, early-turn bias — all measured better and looked worse, all reverted); `connectorType`/`signalType`/`type` are **three independent facts** (345 RJ45 ports carry 3 different signal types); derived values never overwrite human answers.

### FORBIDDEN list — never opened by a coder agent, never ported, path-banned in briefs

- `C:\Claude\ProjectSchema\**` (upstream AGPL-3.0) — all of it.
- `steps-ai .../romtegning/layout/banesok.js`, `.../layout/rutekvalitet.js`, `.../model/connectorAccepts.js` (AGPL-derived).
- ProjectSchema's device catalogue / community templates (no clear licence grant).

The orchestrator and Sindre may read forbidden files to understand approaches. **In coder-agent briefs these paths may appear ONLY inside an explicit "do not open" prohibition — never as a source citation — and excerpts from them never appear anywhere** (CONTRIBUTING §1). Clean-room waves (the Q router/score waves and G.W2) always carry that prohibition with the paths named. Tell-tale identifier markers scanned for by CI (B2): `banesok`, `rutekvalitet`, `connectorAccepts`, `stygghetstall` (the upstream quality scorer's internal vocabulary), plus the `ProjectSchema` strings outside the format-reader paths.

## Consequences

- Copper starts from measured, production-proven designs instead of guesses, at the cost of a porting effort that doubles as the typing effort.
- The router and quality scorer — the hardest components — are rewrites by design and must be re-validated against the fixture sheets from scratch.

## What would reopen this

Bravo obtaining a commercial licence or relicensing agreement covering the ProjectSchema-derived files (moves items from FORBIDDEN to PORT); or the steps-ai notices position changing.
