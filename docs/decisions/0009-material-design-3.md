# ADR-0009: GUI design system — Material Design 3, dark/light following the OS

> **Status:** accepted · **Date:** 2026-08-28 · **Deciders:** Sindre

## Context

Copper needs one visual system across the shell and every module surface (ADR-0007), with accessibility guarantees that carry EN 301 549 (ADR-0008) rather than fight it. Sindre has directed: **Google Material Design, latest generation, with dark and light mode following the OS setting.** The latest generation is **Material Design 3 (M3)**, including its 2025 "M3 Expressive" evolution. One implementation caution, stated honestly: Google's official web *component* library (`@material/web`) was moved to maintenance mode in 2025, and the major React kits are M2-flavored — so betting the component layer on a third-party M3 kit is a rot risk. The M3 *token system and spec* are the stable, valuable part.

## Decision

1. **M3 is the design system; tokens are the implementation, components are ours.** Copper adopts the M3 spec — color roles, type scale, shape scale, elevation, state layers, motion — as **design tokens (CSS custom properties)**, and styles its own hand-written components to that spec (consistent with ADR-0002's no-UI-kit stance, which this ADR refines rather than reverses). Follow M3 Expressive guidance where it updates M3; verify current spec text at the wave, not from this ADR's date.
2. **Color schemes are generated, not hand-picked:** `@material/material-color-utilities` (Google's official library, Apache-2.0 — passes the licence gate) generates the full M3 tonal palettes and color roles from Copper's brand seed **`#B87333` (copper)**. Both light and dark scheme token sets are emitted at build time.
3. **Dark/light follows the OS, period:** `color-scheme: light dark` on the root plus `prefers-color-scheme`-scoped token values. No manual theme toggle at launch (adding one later is a token-layer change, not a redesign). No flash-of-wrong-theme: tokens for both schemes ship in the initial CSS.
4. **Contrast comes from the role system:** every foreground sits on its paired role (`on-primary` over `primary`, `on-surface` over `surface`, …) — this is how ADR-0008's WCAG AA obligation is carried structurally instead of audited case-by-case. The a11y ratchet wave (B69) asserts pair usage where it can.
5. **Canvas rule — domain color is not theme color:** signal-class colors, status colors (`planned` vs `active`), and validation severities are *domain* palettes layered on the M3 scheme: each gets a light-scheme and dark-scheme tone generated from its own seed via the same tonal-palette machinery, must meet contrast against `surface` in **both** schemes, and must never be remapped by theme switching (a Dante-blue cable is the same identity in dark mode, at an adjusted tone). Printed/DXF/PDF outputs always render on the light scheme regardless of OS setting — paper is light.
6. **Density:** Copper is a professional tool; surfaces default to M3's compact/dense reference points where the spec offers them (tables, schedules, palette lists), standard density elsewhere.

## Consequences

- B68 (U.W1) becomes the **M3 token foundation wave**: color-utilities dependency, token generation, `color-scheme` wiring, type/shape/elevation scales — before any surface builds chrome.
- One new dependency (`@material/material-color-utilities`); zero component-library dependencies to rot.
- The docs site (docsify) keeps its own theme — it is not the product and does not carry this ADR.

## What would reopen this

Google shipping (and committing to) a first-party, actively maintained M3 web component layer worth adopting; or the hand-written component cost measurably exceeding the token-only savings.
