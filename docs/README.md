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
- [ADR-0007 — Copper is the vertical-suite front end](decisions/0007-copper-is-the-vertical-suite-front-end.md)
- [ADR-0008 — EU/Nordic compliance baseline](decisions/0008-eu-nordic-compliance-baseline.md)
- [ADR-0009 — Material Design 3, OS-following dark/light](decisions/0009-material-design-3.md)
- [ADR-0010 — elkjs EPL-2.0 licence exception](decisions/0010-elkjs-epl-licence-exception.md)
- [ADR-0011 — Identity, session, tenancy](decisions/0011-identity-session-tenancy.md) *(proposed — HS-9)*
- [ADR-0012 — Deployment posture](decisions/0012-deployment-posture.md) *(proposed)*
- [ADR template](decisions/0000-template.md)

## Handoffs

- [Module 6 completion guide](m6_completion_guide.md) — build spec for the NCE ML orchestrator (surface hole fix, W13a–W20, the contract table Copper consumes)

## Orchestration

Development runs as an orchestrated promptwave ledger, executed by Gemini Flash 3.7 High in Antigravity with a strong-Gemini orchestrator. The ledger, contract, boot prompt, and wave briefs live in [`orchestration/`](https://github.com/sindrehaugen/Copper/tree/main/orchestration) (tracked in git, orchestrator-only writes).

## Proposals

- [Rev 2 build proposal — "The Copper Layer"](proposals/COPPER_REV2_2026-08-26.html ':ignore') (2026-08-26; the founding document)
