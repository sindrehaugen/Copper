# ADR-0010: elkjs licence exception — EPL-2.0, unmodified dependency use only

> **Status:** accepted · **Date:** 2026-08-28 · **Deciders:** Sindre

## Context

ADR-0002 claimed "elkjs and @xyflow/react are MIT". **That was wrong for elkjs**: it is licensed `EPL-2.0 OR GPL-3.0-or-later` (verified against the npm registry 2026-08-28; elkjs is transpiled from the Eclipse Layout Kernel, which is EPL). Neither branch is on the CONTRIBUTING §2 allowlist, so the B2 licence gate would correctly fail the moment B23 installs it. elkjs is load-bearing (auto-layout, ADR-0002) and Romtegning-proven; the alternatives (dagre — unmaintained; custom layered layout) are worse.

## Decision

Copper elects the **EPL-2.0** branch of the dual licence and records a scoped exception:

1. elkjs is used as an **unmodified dependency** only. EPL-2.0 is file-level weak copyleft: consuming it as a library does not impose obligations on Copper's own code; obligations attach to the EPL-licensed component itself.
2. Obligations honored: licence notice retained (node_modules metadata + an entry in a `THIRD-PARTY-NOTICES.md` when one is authored), and the component's source is available upstream (unmodified use — the upstream repository satisfies source availability).
3. **Copper never forks, patches, or vendors a modified elkjs.** A needed fix goes upstream as a PR; until merged, work around it in Copper code. A modified copy would attach EPL source obligations to the modification and is banned.
4. The GPL branch is expressly **not** elected.
5. Mechanics: `scripts/licence-exceptions.json` (B2) gets one entry — `{"name": "elkjs", "licence": "EPL-2.0", "decision": "docs/decisions/0010-elkjs-epl-licence-exception.md"}`. The gate continues to fail any other EPL package without its own recorded decision.

## Consequences

- ADR-0002's licence claim is corrected (amended in place, dated).
- The exception mechanism designed in B2 gets its first real entry, proving the shape.
- CONTRIBUTING §2 gains one line: EPL-2.0 is allowed only via a recorded per-package exception.

## What would reopen this

Needing to modify elkjs itself; or an upstream relicensing.
