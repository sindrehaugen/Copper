# ADR 0012: Relicense Speaker Design Tool (SDT) Core to MIT

## Status
Accepted (2026-08-31)

## Context
The Copper project requires robust acoustic engineering and DSP calculations to support signal-chain analysis, 70V/100V line design, and system tuning. The legacy *Speaker Design Tool v2.0* (SDT), built under the Bravo IP umbrella, contains a fully tested, ~1,000-line core physics engine covering these exact requirements (complex math, driver models, transmission lines, room acoustics, and Merlijn van Veen formulas).

Previously, this code was unintegrated due to licensing and IP constraints (Hard Stop HS-10).

Sindre Løvlie Haugen has explicitly confirmed that the Bravo IP position allows for relicensing. The directive was given to "relicense the SDT. and start manufacturing".

## Decision
1. We will relicense the src/core/* modules from the legacy *Speaker Design Tool v2.0* to the **MIT License**.
2. This code will be lifted into the Copper monorepo under packages/acoustics/.
3. The Merlijn van Veen attribution headers in mvv.ts and subArray.ts will be retained verbatim, as required by the original implementation agreements.
4. The legacy SDT repository will have a note added indicating that its core physics modules have been relicensed to MIT and ported to Copper.
5. Legacy CSV data (Speakers, Amps, Cables) will be imported into the Copper catalog. A SOURCES.md provenance file will track the origin of each brand's data.

## Consequences
- **Positive:** Unblocks Lane A (Acoustics) and allows Copper to natively perform complex DSP and chain analysis without rewriting verified physics code.
- **Positive:** Clarifies the IP status of the acoustics engine for future open-source or commercial dual-licensing of Copper.
- **Negative:** We must maintain the acoustic core inside a separate package to ensure the MIT boundary is clear from the rest of the application if Copper's overarching license changes.
