# ADR-0001: NCE is the store; Copper persists nothing

> **Status:** accepted · **Date:** 2026-08-28 · **Deciders:** Sindre

## Context

Document-first tools (ProjectSchema model) hold truth in a drawing file and export to inventory systems, which creates two stores describing one building, reconciled by a human remembering to re-export. Drift is structural. NCE Module 6 already owns `DEVICE`, `PORT`, `SIGNAL_CHAIN`, `RACK` and `CABLE` as first-class node types with tenancy, provenance, event replay and an MCP tool registry.

## Decision

Copper has no database. Every persisted fact about a design lives in NCE as nodes and edges. The canvas is a projection; canvas-only state (viewport, selection, unsaved gestures) is ephemeral client state. Layout coordinates are design data and are stored in NCE, not in local files. NetBox is a schema convention and a one-shot import/export door — never a runtime dependency, never a background sync, and Copper does not emulate the NetBox REST API.

## Consequences

- No save files, no export/import reconciliation loop, one source of truth.
- Copper cannot ship ahead of NCE's write surface: missing write tools are landed in NCE first (the `NS-*` ledger lane).
- Draft/what-if design state needs an explicit server-side concept (ADR-0003) because "unsaved document" no longer exists.
- Offline editing is out of scope by design.

## What would reopen this

If sampling real Bravo projects shows most drawn content cannot be modelled as nodes/ports (loose kit, endpoint-less runs), the object-model premise fails and a document-first fallback would be reconsidered — per Rev 2 §07.
