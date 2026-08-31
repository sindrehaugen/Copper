# Contributing to Copper

Copper is a private Bravo project. These rules are contractual for every contributor — human or agent.

## 1. Clean-room policy (AGPL firewall)

ProjectSchema (`C:\Claude\ProjectSchema`, upstream AGPL-3.0) is **study material only**.

- **Never copy code, comments, JSON structures, device definitions, or port-type tables from ProjectSchema into this repo.** Its device catalogue and community submissions have no clear licence grant; its source is AGPL-3.0, and network use of derived code would trigger AGPL §13 source-offer obligations toward every user of a Bravo-facing service.
- Reading ProjectSchema to understand *approaches* (e.g. trunk-nested routing, patch-bay modelling) is permitted **for humans and the orchestrator only**. Coder-agent briefs must never contain ProjectSchema file paths or excerpts. If a brief needs the idea, the orchestrator restates the idea in its own words in the brief.
- If you are unsure whether something crosses the line, it does. Stop and ask.

## 2. Dependency licence policy

- Allowed: MIT, BSD-2/3, Apache-2.0, ISC, CC0-1.0, Unlicense, Python-2.0, 0BSD. (This list is the single source; other documents cite it rather than restating it.)
- Forbidden: AGPL, GPL, LGPL, SSPL, PolyForm (any), BUSL, Elastic, proprietary-without-grant. `netbox-branching` (PolyForm Shield) is explicitly not a dependency.
- EPL-2.0 is allowed only via a recorded per-package exception in `scripts/licence-exceptions.json` citing a `docs/decisions/` file — currently exactly one: elkjs (ADR-0010, unmodified-dependency use only).
- CI enforces this with a licence checker; do not add an exception entry without a written decision in `docs/decisions/`.
- `netbox-community/devicetype-library` content is CC0-1.0 and free to vendor. Bravo-authored device types destined for upstream contribution are authored under CC0-1.0 in their own directory.

## 3. Repo boundary (where code belongs)

Copper owns **no data and no store**. NCE is the store.

- Canvas, routing engine, layout, catalogue import/export tooling, exchange-format converters, the signal-type taxonomy and compatibility tables → this repo.
- Node schemas, write tools, physical validation authority, geometry/status storage, signal-type *persistence* (extension keys on NCE capability rows), BOM_LINE emission, cable-path tracing (future) → NCE (`sindrehaugen/NCE`). Module 6 completion is currently executed by the NCE ML orchestrator per `docs/m6_completion_guide.md`; the ledger's NS lane content-verifies and consumes it.
- If a change here starts persisting design state anywhere but NCE, it is wrong by definition.

## 4. Working agreements

- Line endings are LF everywhere (`.gitattributes` pins it). Never commit CRLF.
- TypeScript is `strict`; no `any` without an inline justification comment.
- A test gates a behavior only if removing the behavior makes the test fail. Confounded tests are rejected at gate.
- State what you did NOT verify in every PR/wave report. A named omission is a scope decision; a silent one is a defect.
- No pushes or merges by coder agents, ever. The orchestrator squash-merges `[PASSED TAG]` wave branches to Copper `main` and pushes it; anything touching NCE, tags/releases, and all outward-facing actions need Sindre's explicit go.
- Local dev loop: NCE runs locally via its own `make local-up`; the BFF gets `NCE_BASE_URL`/`NCE_API_KEY` from env and a dev-identity seam (ADR-0011) so no Entra credentials are needed for local or agent work.
