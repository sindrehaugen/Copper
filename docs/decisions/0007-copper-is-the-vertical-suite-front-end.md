# ADR-0007: Copper is the front end for the NCE vertical suite — tech is the business

> **Status:** accepted · **Date:** 2026-08-28 · **Deciders:** Sindre

## Context

Copper began as the Module 6 design front end. Sindre has widened the mandate: Copper is **the** front end for NCE's vertical modules — the operational cockpit of an AV/IT/network-operations company run on the principle that *the tech is the business*: sales, procurement, project, economy, inventory, assets, support and network operations all run on NCE, and Copper is where people meet them. The design canvas remains the flagship surface, not the whole product.

NCE already exposes REST route families for most engines (`/api/sales/*`, `/api/product/*`, `/api/procurement/*`, `/api/project/*`, `/api/economy/*`, `/api/inventory/*`, `/api/assets/*`, …) plus the MCP registry — unlike Module 6, most modules have a reachable surface today. The Bravo Portal (`steps-ai`) is the temporary scaffolding NCE is meant to replace; Copper is the replacement's face, and the standing rule applies: no Portal capability is declared superseded until Copper + NCE have a **wired** equivalent.

## Decision

1. **Copper = shell + surfaces.** One application shell (navigation, session, tenancy, i18n, notifications) hosting per-module *surfaces*. Every surface talks through the same BFF to NCE's existing module routes/tools — Copper stays storeless (ADR-0001) across all of them, not just design.
2. **The design canvas is the flagship surface** and keeps its entire existing plan. Module surfaces are added by evidence, not ambition: a scoping wave inventories what each NCE engine actually exposes today (the seam-audit method, applied suite-wide), and Sindre picks the build order at a HARD-STOP.
3. **Tech-is-the-business doctrine, made visible:** provenance and citations (C9a), event-log auditability, divergence between intent and reality, and AI-action confirmation are first-class UI, not admin afterthoughts — the trust machinery IS the product's differentiator.
4. **Agent parity holds suite-wide** (ADR-0006 §9): every Copper surface action corresponds to an NCE tool/route an agent could call without the UI.

## Consequences

- The Portal-replacement question becomes concrete per surface: each module surface names the Portal capability it supersedes, or explicitly doesn't.
- The BFF grows a generalized, allowlisted module-route proxy instead of design-only endpoints.
- Copper's shell decisions (i18n, accessibility, tenancy UX) become suite-wide contracts (ADR-0008) before most surfaces exist — cheap now, expensive later.

## What would reopen this

A decision to keep the Portal fork as the long-term operations UI, or NCE modules diverging into per-module frontends.
