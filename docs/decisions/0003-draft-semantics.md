# ADR-0003: Draft semantics — NetBox lifecycle status + design revisions

> **Status:** proposed — **needs Sindre's sign-off before NS.W7 dispatches** (one-way door: it shapes every write) · **Date:** 2026-08-28 · **Deciders:** Sindre

## Context

NCE records what *is*; design work is speculative, half-finished, and sometimes carries competing options for the same room. `kg_nodes` has no status column; NCE's "propose-only" idiom means *return-only* (nothing persisted), which cannot back a canvas that must survive a browser refresh. The seam audit found: an `action_approval_queue` table with no writer, a human decision gate (`do_validate_design`, accept/override per line, no confidence auto-accept), and replay-fork namespaces as the only staging-like machinery.

## Decision (proposed)

Follow ADR-0006 §5 — **the NetBox-native mechanism, layered**:

1. **Lifecycle = `status` with NetBox vocabulary on every design object**, stored in the Module 6 side-table added by NS.W5/NS.W7 (same `(namespace_id, node_label)` key and FORCE-RLS pattern as `system_design_device_capabilities`). Devices: `planned / staged / active / offline / decommissioning / inventory`. Cables: `planned / connected / decommissioning`. Canvas writes land immediately as **`status=planned`** — persistent, tenant-scoped, visible, and honestly labeled as intent. No shadow namespace, no client-side draft store.
2. **Promote = the existing human gate.** `planned → active` runs through `do_validate_design`'s accept/override verdicts plus a row in `action_approval_queue` (its first writer). Promote is human-confirm-only at launch (Contract B posture); nothing auto-promotes on confidence.
3. **Competing options = design revisions, not branches.** A `DESIGN_REVISION` concept (option A / option B for the same room) scopes `planned` objects to a named revision; exactly one revision may be promoted, which retires the siblings (they keep their audit trail, they never become `active`). This is deliberately NOT netbox-branching (PolyForm Shield — forbidden) and deliberately simpler: revisions scope *planned* objects only; `active` state is always singular.
4. **As-built stays downstream:** `active` objects feed the existing NetBox-bridge `promoted_to_asbuilt` / divergence machinery untouched.

4. **Concurrent edits within one revision get an optimistic-concurrency token** (audit finding, 2026-08-28): a per-design `version` returned by reads and checked by writes (`expected_version` → conflict on staleness). Without it, whole-list upserts are silent last-writer-wins between two canvas users. Carried into the m6 completion guide Rev 2 §2 so ML builds it into the write tools from the start.

## Consequences

- Reads must filter by status everywhere (`active`-only for as-built consumers, `planned+active` for the canvas) — the read adapter (NS.W2) takes a `statuses` parameter from day one.
- Deletion of `planned` objects is cheap and safe; deletion of `active` objects is the hard case NS.W8 designs separately.
- One more table column set, zero new infrastructure.

## What would reopen this

Real usage showing per-object status is too fine-grained for how designers actually iterate (whole-design checkpoints wanted instead), or the revision concept proving unable to express multi-room option sets.
