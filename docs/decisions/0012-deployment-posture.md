# ADR-0012: Deployment posture — internal-only, EU-resident, containerized

> **Status:** proposed (decision may be deferred; recorded so the assumption is named, not silent) · **Date:** 2026-08-28 · **Deciders:** Sindre

## Context

The audit flagged that no deployment story existed anywhere: ADR-0008 asserted "EU-resident hosting assumption for the BFF" with nothing carrying it, and there was no environment matrix, TLS, or secrets provisioning for app+BFF.

## Decision (proposed)

1. **Internal-only v1:** Copper serves Bravo staff behind Entra ID (ADR-0011). No public exposure, no multi-org tenancy beyond NCE namespaces.
2. **Target: Azure Container Apps in an EU/Norwegian region** (aligning with the Portal's Azure-readiness direction and D365 estate): one container for the BFF (serving the built app statically), TLS by platform, secrets from Key Vault into env.
3. **Environments:** `dev` (local: BFF + Vite against local NCE, dev-identity seam) and `prod`. No staging until a real release cadence exists.
4. **This ADR schedules nothing.** An ops wave lands when the integration proof (HS-3) passes and something is worth deploying; until then the decision's value is that ADR-0008's residency claim has an owner and the BFF is built 12-factor (config via env, stateless) so the target stays cheap.

## What would reopen this

Customer-facing hosting, on-prem/edge delivery requirements (the NCE PL lane's world), or an org decision to consolidate hosting elsewhere.
