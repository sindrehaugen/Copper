# Copper

**The system design and integration front end for AV + IT, running on NCE.**

Copper is an L1-first design canvas: devices with ports, cables between ports, racks, rooms, signal chains — drawn as live projections of NCE's graph, not as documents. It has **no database of its own**: NCE Module 6 is the only store, the drawing is a view of it, and NetBox is a schema convention plus a one-shot import/export door — never a dependency and never a sync target.

> Full architectural rationale: [docs/proposals/COPPER_REV2_2026-08-26.html](docs/proposals/COPPER_REV2_2026-08-26.html) (Rev 2 build proposal), distilled in [docs/architecture.md](docs/architecture.md).

## The three rules that define the project

1. **NCE is the store.** If code in this repo starts persisting design state anywhere but NCE, it is wrong by definition. Node schemas, write tools, validation authority and geometry/status storage live in NCE — their completion is currently with the NCE ML orchestrator ([docs/m6_completion_guide.md](docs/m6_completion_guide.md)); BOM emission is the ledger's B lane; cable-path tracing is named future NCE work (ADR-0006 §3 note).
2. **NetBox is a convention, not infrastructure.** Copper's device/port/rack vocabulary stays compatible with the NetBox schema and consumes `devicetype-library` (CC0) — but Copper does not run NetBox, does not sync with it, and does not emulate its REST API.
3. **Clean room against EasySchematic.** AGPL-3.0 study material only — approaches may be learned, code may never be copied. See [CONTRIBUTING.md](CONTRIBUTING.md) §1.

## Repository layout

| Path | What |
|---|---|
| `docs/` | docsify documentation site (same tooling as NCE), incl. the development plan and ADRs |
| `orchestration/` | The Copper Ledger (`CL.md`), orchestrator boot prompt, wave prompts, contracts and gate protocols |
| `app/` | The Copper web application (created by wave B1) |
| `bff/` | The stateless backend-for-frontend holding NCE credentials and the session (created by wave B19) |
| `catalog/` | Device-type tooling and Bravo-authored device types in devicetype-library format (created by wave B7) |
| `rig/` | Headless layout/routing quality rig over the 15 fixture sheets (created by wave B6) |
| `scripts/` | CI ratchets: licence gate, forbidden-source scan, dependency audit (created by wave B2) |

## Development

Development runs as an orchestrated promptwave ledger — see [orchestration/CL.md](orchestration/CL.md) for rules, contracts, the wave queue, and current state. The orchestrator boot prompt for Antigravity is [orchestration/BOOT_PROMPT.md](orchestration/BOOT_PROMPT.md).

Docs are published with docsify from `docs/` via `.github/workflows/deploy-pages.yml` (GitHub Actions Pages flow; activates when the repo plan supports Pages). To browse locally:

```bash
npx serve docs
```
