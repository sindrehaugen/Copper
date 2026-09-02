# ADR-0009: GUI Design System — Material Design 3 with Copper Expression Layer

> **Status:** accepted · **Date:** 2026-08-28 (Updated: 2026-09-02 for Batch 129 / SH.W1) · **Deciders:** Sindre

## Context

Copper requires a unified visual and design token system across the entire application shell and all modular engineering surfaces (ADR-0007), providing structural accessibility guarantees under EN 301 549 and WCAG 2.1 AA (ADR-0008). 

Material Design 3 (M3) serves as the underlying structural substrate, while Copper defines its own bespoke expression layer reflecting professional AV CAD and hardware engineering tools.

## Decision

1. **Copper Expression Accent Pair:**
   - **Copper Primary:** `#B87333` (warm metallic copper)
   - **Patina Secondary:** `#3A6E6A` (oxidized copper teal)
   - Both light and dark schemes are generated dynamically via `@material/material-color-utilities` using custom tonal palettes.

2. **Cool-Graphite Neutrals:**
   - Neutrals are anchored on cool-graphite tones (HCT hue 215, low chroma) rather than generic greys, giving a focused, professional engineering look.

3. **Dedicated Semantic Severity Ramp:**
   - **Blocker:** Critical errors, structural failures, blocker violations (Crimson seed `#BA1A1A`).
   - **Risk:** Warnings, cautions, capacity alerts, design hazards (Golden Amber seed `#C67D00`).
   - **Advice:** Recommendations, optimization tips, informational notes (Ocean Blue seed `#006590`).
   - **Strict Isolation:** The semantic ramp NEVER shares or borrows values with the Copper/Patina accent pair.

4. **Three Interaction Densities (HS-14):**
   - **Comfortable (44px row height):** Touch-friendly, presentation mode.
   - **Compact (36px row height):** **DEFAULT** density, optimized for 1080p display workflows and dense CAD layouts.
   - **Dense (28px row height):** Channel strips, high-density patch bays, port grids, dense BOMs.

5. **Typography & Tabular Numerics:**
   - **Tabular figures:** `font-variant-numeric: tabular-nums` enforced across numerical tables, channel lists, coordinates, frequencies, and voltages.
   - **Monospace Stack:** Native true monospace font stack (`ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`) for identifiers, reference designations, MACs, and IP addresses.

6. **Two Functional Elevation Levels:**
   - **Level 0:** None / flat surface resting state.
   - **Level 1:** Subtle surface elevation for cards, tool panels, sidebars.
   - **Level 2:** Elevated dialogs, floating context menus, dragged items, popovers.

7. **Functional Motion & A11y Resilience:**
   - **Short (120ms):** Toggles, hover states, micro-interactions.
   - **Medium (200ms):** Drawer expand/collapse, modals, layout shifts.
   - **Reduced Motion:** Default duration is 0ms, animated transitions active only under `@media (prefers-reduced-motion: no-preference)`.

8. **Shared Design Package (`@copper/design`):**
   - Token constants, types, CSS property generators, and density scales are exported from `packages/design` for consumption across all apps and packages.

## Consequences

- Full token consistency across frontend components and future modules.
- Zero runtime overhead: CSS custom properties generated at build time.
- Structural compliance with WCAG 2.1 AA and EN 301 549 contrast and motion requirements.
