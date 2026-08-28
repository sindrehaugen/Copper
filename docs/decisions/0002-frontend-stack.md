# ADR-0002: Frontend stack — Vite + React + TypeScript strict + @xyflow/react + elkjs + zustand

> **Status:** accepted · **Date:** 2026-08-28 · **Deciders:** Sindre

## Context

Bravo already built a working AV design canvas — **Romtegning / AV Designer** in `bravo-steps-ai/steps-ai` (190 commits since 2026-06-14, `frontend/src/lysning/romtegning/`, ~25k lines). It proved a stack against 15 real anonymized customer AV sheets (367 devices, 1,164 ports): `@xyflow/react` 12 + `elkjs` for layout, an A* orthogonal cable router, two-axis connection validation, DXF export, and a headless routing-quality rig. Its weaknesses are also measured: zero TypeScript (all contracts live in prose/JSDoc), a 2,504-line app shell around a mutable module singleton with ~30 `useState` hooks, and Norwegian identifiers throughout.

## Decision

Copper uses: **pnpm · Vite · React 19 · TypeScript `strict` · @xyflow/react 12 · elkjs · zustand · @tanstack/react-query · zod · vitest · Playwright**. English identifiers only. No UI kit initially (hand-written CSS like Romtegning); revisit if form-heavy surfaces appear.

Structural rules carried over from what Romtegning proved:

1. **The design document is the source of truth; React Flow nodes/edges are a pure projection** (`toFlow`-style function). The same computed layout feeds canvas, print, and every export, so they cannot disagree.
2. **Grid pitch discipline:** one pitch constant in `geometry.ts`; every card dimension, header height, padding and port-row height is a multiple of it, enforced by a unit-test ratchet. (Romtegning measured 70% of cable corners falling off-grid when dimensions drifted 19px off-pitch.)
3. **One constant for port-dot inset** shared by every renderer — four renderers with four private copies is a recorded incident.
4. **State in zustand, immutable updates, snapshot-stack undo** — explicitly NOT the module-singleton + revision-counter pattern; that is Romtegning's recorded weak point.
5. **React Flow v12 + React 19 node-measurement trap:** read steps-ai `docs/adr/0021-romtegning-react-flow-i-lysning.md` before touching node rendering; seed `initialWidth`/`initialHeight` in the projection and use the measure-on-mount pattern.

## Consequences

- Everything ported from Romtegning is ported **into TypeScript**, which forces the implicit contracts in its prose comments into types — a feature, not a tax.
- React 19 + React Flow 12 quirks are known and documented rather than novel.
- elkjs and @xyflow/react are MIT; the licence gate stays clean.

## What would reopen this

React Flow v12 proving unable to carry 1,000+ device sheets at interactive frame rates after virtualization work (Romtegning's evidence says it can); or the routing engine needing canvas-level control React Flow cannot expose.
