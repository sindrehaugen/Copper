# Batch 004b — F.Wave 4b — `schema-components` (SPLIT: this is the COMPONENTS + CABLE + EXTENSION half)

> **FRESH SESSION REQUIRED.** Fully self-contained brief; one wave = one session = one branch = one commit = one TAG.
> **Engine class:** Flash (Gemini Flash 3.7 High, turbo). Unwritten design decision → STOP and report.
>
> **⚠ SPLIT 2026-08-28 (sizing audit):** sibling **Batch_004 (B4a)** already built Site/Location/Rack/DeviceType-metadata/Device-basics + status enums + the citation meta-ratchet in the same file. **Do not redefine or restructure anything B4a exported — extend only.** If a B4a shape is genuinely wrong, STOP and report; do not fix it here.

Rules 1–11: as in `orchestration/_TEMPLATE.md`, verbatim. Branch: `cu-b004b-f-w4b-schema-components`.

**Skills:** typescript-pro (primary), zod-validation-expert, database-design
**Depends on:** B4a
**Reads (context, do not edit):** `docs/decisions/0006-netbox-methodology-is-binding.md` §1–§3, §6 · `app/src/model/schema.ts` as B4a left it
**Files (exactly these):** `app/src/model/schema.ts` (chokepoint owner), `app/src/model/schema.test.ts`
**Goal:** complete the document model: NetBox component templates and materialized components, Cable with two terminations, the signal extension layer, and `DesignDocument`. Citation comments (`// netbox:` / `// extension:`) on every field — B4a's meta-ratchet already gates this.

Model additions:
- `DeviceType` component **templates**: `InterfaceTemplate`, `FrontPortTemplate` (+`rearPortId` + `rearPortPosition`), `RearPortTemplate` (+`positions`), `ConsolePortTemplate`, `PowerPortTemplate`, `PowerOutletTemplate`, `ModuleBayTemplate`, `DeviceBayTemplate`.
- `Device` gains owned **materialized components** (same shapes minus `Template` — NetBox instantiate-then-own, ADR-0006 §1).
- `Cable`: exactly two `CableTermination`s (each `deviceId` + `portRef` discriminated by component class), `type?`, `lengthM?`, `status` (enum exactly: `planned|connected|decommissioning`).
- Extension layer (each field marked `// extension:`): `SignalClass` (id, name, category), per-port `signalClassId?`, `connectorType?` — **three independent facts** (`portKind` vs `signalClassId` vs `connectorType`); nothing derives one from another.
- `DesignDocument`: `schemaVersion` (literal `1`), `designLabel`, collections of all of the above, `revision?` (string — ADR-0003's hook, no semantics yet).

**Steps:**
1. Extend the schemas; keep every B4a export byte-compatible (B4a's tests must pass untouched).
2. Tests: round-trip a two-device + one-cable + one-front/rear-mapped-plate document; RED cases: a third termination on a cable, a FrontPort referencing a missing RearPort (zod refine), invalid cable status, a termination whose `portRef` class doesn't exist on the device.
3. Gate; commit.

**Acceptance:** `pnpm vitest run app/src/model/schema.test.ts` green including all B4a tests untouched; new RED cases proven.

**§6.4 mutation table (minimum):** (1) allow 3 terminations in a scratch copy → termination test RED; (2) drop the front→rear refine → mapping test RED; (3) derive `signalClassId` from `connectorType` anywhere → the three-independent-facts test RED (write that test: same connector, two different signal classes, both valid).

## Final: as `orchestration/_TEMPLATE.md` §Final — STOP and report. Name what you did NOT model (ModuleBay population semantics, DeviceBay children, IPAM — deferred by design).
