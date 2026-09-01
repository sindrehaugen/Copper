# Catalog Provenance

This directory stores hardware catalog definitions for Copper. 
To ensure design validity, all catalog files must have documented sources.

## `bravo` namespace
Internal devices produced by Bravo. Kept from the legacy `devicetype-library`.

## `audio` namespace
Imported from legacy `Speaker Design Tool v2.0` database CSVs (`speakers_db_v2.csv`, `amplifiers_db_v2.csv`, `cables_db_v2.csv`).
- 406 Speakers
- 331 Amplifiers
- 183 Cables

**Import Date:** 2026-08-31
**Data Strategy:** Extracted via `scripts/import-sdt-csv.ts` into strict NetBox YAML schema under `copper_extensions.acoustics`.

All additions to this catalog should cite their manufacturer specification sheets.
