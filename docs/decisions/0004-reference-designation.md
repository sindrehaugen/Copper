# ADR-0004: Reference designation — one identifier that crosses every boundary

> **Status:** proposed — decide before X-lane (labels/exports) dispatches; does not block F/K/NS/P lanes · **Date:** 2026-08-28 · **Deciders:** Sindre

## Context

A device on a drawing, a printed cable label, a BOM line, a D365 asset, a functional location and a captured interface must all refer to the same physical object, or none of the exchange/observe integrations can join records. Candidate schemes: TIA-606 (telecom infrastructure labelling), AVIXA cable labelling, IEC 81346 (general reference designation — steps-ai already has `model/tfm.js` for the Norwegian TFM flavor). NCE constraint discovered in the seam audit: labels feed `LIKE` prefix lookups, so **generated ids must never contain `_` or `%`** (SQL wildcards — a recorded NCE bug class).

## Decision (proposed)

- Copper **derives** labels from structure (site/location/rack/position + type + sequence); users never type them.
- The scheme is **IEC 81346-flavored** (aligning with steps-ai's TFM groundwork and Norwegian construction practice), with a TIA-606-compatible rendering for cable labels.
- The designation is carried as a dedicated field, not smuggled into `kg_nodes.label` (which keeps NCE's `FL:<NS>:…` conventions untouched).
- Charset: `A–Z 0–9 . : + = -` only. No `_`, no `%`, no spaces.

## What would reopen this

Bravo standardizing on a different client-mandated scheme (Statsbygg/TFM variants), or D365 integration requiring its own designation as primary.
