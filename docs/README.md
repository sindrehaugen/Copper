# Copper Documentation

**Copper** is the system design and integration front end for AV + IT, running on NCE as its only store, following the NetBox methodology as a binding contract.

## Start here

- [Architecture](architecture.md) — what Copper is, the layers, the loop it closes, CAD/BIM integrations
- [Development plan](development_plan.md) — objectives, lanes, sequencing, HARD-STOPs, quality & efficiency machinery
- [NCE seam audit](nce_seam_audit.md) — what exists in NCE today vs what the NS lane builds (verified 2026-08-28)

## Decisions (ADRs)

- [ADR-0001 — NCE is the store](decisions/0001-nce-is-the-store.md)
- [ADR-0002 — Frontend stack](decisions/0002-frontend-stack.md)
- [ADR-0003 — Draft semantics](decisions/0003-draft-semantics.md) *(proposed — HS-1)*
- [ADR-0004 — Reference designation](decisions/0004-reference-designation.md) *(proposed)*
- [ADR-0005 — Romtegning reuse & licence lists](decisions/0005-romtegning-reuse-and-licence-lists.md)
- [ADR-0006 — NetBox methodology is binding](decisions/0006-netbox-methodology-is-binding.md)

## Orchestration

Development runs as an orchestrated promptwave ledger, executed by Gemini Flash 3.7 High in Antigravity with a strong-Gemini orchestrator. The ledger, contract, boot prompt, and wave briefs live in [`orchestration/`](https://github.com/sindrehaugen/Copper/tree/main/orchestration) (tracked in git, orchestrator-only writes).

## Proposals

- [Rev 2 build proposal — "The Copper Layer"](proposals/COPPER_REV2_2026-08-26.html) (2026-08-26; the founding document)
