# Headless Fixtures Measurement Rig

Headless, fast CLI runner for loading AV fixture sheets through Copper's format reader and emitting per-sheet metrics, totals, and elapsed time to stdout.

## Overview

- **Speed:** Pure Node execution, no DOM / browser required (<1 second for all 15 sheets).
- **Format Reader:** Loads sheets through B5 reader into Copper's `DesignDocument` schema.
- **Contract:** Emits deterministic JSON output with per-sheet metrics (`sheet`, `devices`, `ports`, `cables`, `locations`, `unmappedFieldCount`, `skippedObjects`), `totals`, and `elapsedMs`.
- **Purpose:** Chassis for routing and layout quality scoring (Q lane) without containing any embedded scoring or routing logic.

## Usage

```bash
# Run all 15 fixture sheets and emit JSON to stdout
node rig/run.mjs

# Run test suite
pnpm --filter rig test
```

## Fixture Provenance Table

Ground truth dataset containing 15 real anonymized customer AV sheets (Bravo-owned data, ADR-0005 PORT list).

| Fixture | Size (bytes) | Copied-From Path | Import Date |
|---|---:|---|---|
| `AV_H1A04` | 72,764 | `steps-ai\frontend\tests\fixtures\av-fasit\AV_H1A04.*` | 2026-08-28 |
| `AV_H1A22` | 35,182 | `steps-ai\frontend\tests\fixtures\av-fasit\AV_H1A22.*` | 2026-08-28 |
| `AV_H1A23` | 29,836 | `steps-ai\frontend\tests\fixtures\av-fasit\AV_H1A23.*` | 2026-08-28 |
| `AV_H1A24` | 53,352 | `steps-ai\frontend\tests\fixtures\av-fasit\AV_H1A24.*` | 2026-08-28 |
| `AV_H1B05` | 35,343 | `steps-ai\frontend\tests\fixtures\av-fasit\AV_H1B05.*` | 2026-08-28 |
| `AV_H1B25` | 42,124 | `steps-ai\frontend\tests\fixtures\av-fasit\AV_H1B25.*` | 2026-08-28 |
| `AV_H2A04` | 25,019 | `steps-ai\frontend\tests\fixtures\av-fasit\AV_H2A04.*` | 2026-08-28 |
| `AV_H2B20` | 29,095 | `steps-ai\frontend\tests\fixtures\av-fasit\AV_H2B20.*` | 2026-08-28 |
| `AV_H3A04` | 32,515 | `steps-ai\frontend\tests\fixtures\av-fasit\AV_H3A04.*` | 2026-08-28 |
| `AV_H3B19` | 16,853 | `steps-ai\frontend\tests\fixtures\av-fasit\AV_H3B19.*` | 2026-08-28 (B5 initial) |
| `AV_H3B20` | 27,080 | `steps-ai\frontend\tests\fixtures\av-fasit\AV_H3B20.*` | 2026-08-28 |
| `AV_H4A04` | 32,453 | `steps-ai\frontend\tests\fixtures\av-fasit\AV_H4A04.*` | 2026-08-28 |
| `AV_H4B21` | 27,407 | `steps-ai\frontend\tests\fixtures\av-fasit\AV_H4B21.*` | 2026-08-28 |
| `AV_U1A21` | 13,950 | `steps-ai\frontend\tests\fixtures\av-fasit\AV_U1A21.*` | 2026-08-28 (B5 initial) |
| `AV_U1A36` | 32,817 | `steps-ai\frontend\tests\fixtures\av-fasit\AV_U1A36.*` | 2026-08-28 |

**Totals:** 15 sheets · 367 devices · 1,164 ports · 278 cables · 65 locations.
