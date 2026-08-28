# Contributing to Copper

Copper is a private Bravo project. These rules are contractual for every contributor — human or agent.

## 1. Clean-room policy (AGPL firewall)

EasySchematic (`C:\Claude\EasySchematic`, upstream AGPL-3.0) is **study material only**.

- **Never copy code, comments, JSON structures, device definitions, or port-type tables from EasySchematic into this repo.** Its device catalogue and community submissions have no clear licence grant; its source is AGPL-3.0, and network use of derived code would trigger AGPL §13 source-offer obligations toward every user of a Bravo-facing service.
- Reading EasySchematic to understand *approaches* (e.g. trunk-nested routing, patch-bay modelling) is permitted **for humans and the orchestrator only**. Coder-agent briefs must never contain EasySchematic file paths or excerpts. If a brief needs the idea, the orchestrator restates the idea in its own words in the brief.
- If you are unsure whether something crosses the line, it does. Stop and ask.

## 2. Dependency licence policy

- Allowed: MIT, BSD-2/3, Apache-2.0, ISC, CC0-1.0, Unlicense, Python-2.0, 0BSD.
- Forbidden: AGPL, GPL, LGPL, SSPL, PolyForm (any), BUSL, Elastic, proprietary-without-grant. `netbox-branching` (PolyForm Shield) is explicitly not a dependency.
- CI enforces this with a licence checker; do not add an ignore entry without a written decision in `docs/decisions/`.
- `netbox-community/devicetype-library` content is CC0-1.0 and free to vendor. Bravo-authored device types destined for upstream contribution are authored under CC0-1.0 in their own directory.

## 3. Repo boundary (where code belongs)

Copper owns **no data and no store**. NCE is the store.

- Canvas, routing engine, layout, catalogue import/export tooling, exchange-format converters → this repo.
- Node schemas, write tools, cable-path tracing, physical validation authority, signal-type data model, BOM_LINE emission → NCE (`sindrehaugen/NCE`), landed as normal NCE waves via the `NS-*` lane in `orchestration/CL.md`.
- If a change here starts persisting design state anywhere but NCE, it is wrong by definition.

## 4. Working agreements

- Line endings are LF everywhere (`.gitattributes` pins it). Never commit CRLF.
- TypeScript is `strict`; no `any` without an inline justification comment.
- A test gates a behavior only if removing the behavior makes the test fail. Confounded tests are rejected at gate.
- State what you did NOT verify in every PR/wave report. A named omission is a scope decision; a silent one is a defect.
- No pushes to `main` by agents. The orchestrator commits; humans merge.
