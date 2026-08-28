# Batch 004 — F.Wave 4 — `schema-core`

> **FRESH SESSION REQUIRED.** Fully self-contained brief; one wave = one session = one branch = one commit = one TAG.
> **Engine class:** Flash (Gemini Flash 3.7 High, turbo). Unwritten design decision → STOP and report.

Rules 1–11: as in `orchestration/_TEMPLATE.md`, verbatim. Branch: `cu-b004-f-w4-schema-core`.

**Skills:** typescript-pro (primary), zod-validation-expert, database-design
**Depends on:** B1
**Reads (context, do not edit):** `docs/decisions/0006-netbox-methodology-is-binding.md` (THE contract for this wave) · `docs/decisions/0004-reference-designation.md` (charset only) · `docs/decisions/0003-draft-semantics.md` (status vocabulary only)
**Files (exactly these):** `app/src/model/schema.ts` (chokepoint owner), `app/src/model/schema.test.ts`
**Goal:** the Copper document model as zod schemas + inferred TS types, NetBox-shaped per ADR-0006. **Every field carries a `// netbox: <object>.<field>` comment or `// extension: <reason>` — a field with neither is a defect.**

Model (all as zod, ids as opaque strings, no `_`/`%`/space in any generated identifier):
- `Site`, `Location` (recursive `parentId`; doubles as building/floor/room), `Rack` (`u_height`, status).
- `DeviceType` with component **templates**: `InterfaceTemplate`, `FrontPortTemplate` (+`rearPortId`+`rearPortPosition`), `RearPortTemplate` (+`positions`), `ConsolePortTemplate`, `PowerPortTemplate`, `PowerOutletTemplate`, `ModuleBayTemplate`, `DeviceBayTemplate`; plus `uHeight`, `isFullDepth`, `weight?`, `airflow?`, `manufacturer`, `model`, `slug`.
- `Device`: instance owning **materialized components** (same shapes minus `Template`), `deviceTypeId`, `siteId`/`locationId`, optional `rackId`+`position`(NUMERIC half-U allowed)+`face`, `status` (enum exactly: `planned|staged|active|offline|decommissioning|inventory`), `designation?` (ADR-0004 charset regex `^[A-Z0-9.:+=-]+$`).
- `Cable`: exactly two `CableTermination`s (each: `deviceId`+`portRef` discriminated by component class), `type?`, `lengthM?`, `status` (`planned|connected|decommissioning`).
- Extension layer (each marked `// extension:`): `SignalClass` (id, name, category), per-port `signalClassId?`, `connectorType?` — **three independent facts** (`portKind` vs `signalClassId` vs `connectorType`); nothing derives one from another.
- `DesignDocument`: `schemaVersion` (literal `1`), `designLabel`, collections of the above, `revision?` (string — ADR-0003's revision hook, no semantics yet).

**Steps:**
1. Author the schemas in dependency order with the citation comments.
2. Tests: round-trip (`parse(serialize(x)) = x`) for a hand-built two-device+one-cable document; RED cases: third termination on a cable, invalid status string, `designation` containing `_`, a FrontPort referencing a missing RearPort (refine), unknown top-level keys rejected (`strict()`).
3. A meta-test that greps `schema.ts` asserting every `z.` field line carries `netbox:` or `extension:` (regex-based ratchet; crude is fine — it gates the habit).
4. Gate; commit.

**Acceptance:** `pnpm vitest run app/src/model/schema.test.ts` green; all RED cases proven in tests.

**§6.4 mutation table (minimum):** (1) allow 3 terminations in a scratch copy → termination test RED; (2) delete one `// netbox:` comment → meta-test RED; (3) widen the designation regex to allow `_` → charset test RED.

## Final: as `orchestration/_TEMPLATE.md` §Final — STOP and report with the full report format. Name explicitly what you did NOT model (IPAM types, ModuleBay population, DeviceBay children semantics — deferred by design).
