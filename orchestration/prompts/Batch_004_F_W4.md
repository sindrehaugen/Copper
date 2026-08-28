# Batch 004 — F.Wave 4a — `schema-core` (SPLIT: this is the CONTAINMENT + LIFECYCLE half)

> **FRESH SESSION REQUIRED.** Fully self-contained brief; one wave = one session = one branch = one commit = one TAG.
> **Engine class:** Flash (Gemini Flash 3.7 High, turbo). Unwritten design decision → STOP and report.
>
> **⚠ SPLIT 2026-08-28 (sizing audit):** the original schema-core wave exceeded the 25-minute budget. This wave (B4a) builds Sites/Locations/Racks/DeviceType-metadata/Device-basics + lifecycle. Its sibling **Batch_004b** builds component templates, materialized components, Cable, the extension layer, and `DesignDocument`. **If you find yourself writing `FrontPortTemplate`, `Cable`, `CableTermination`, `SignalClass`, or `DesignDocument`, you have drifted into B4b — STOP and report.** The split exists so each wave fits a small-context agent; do not re-merge it.

Rules 1–11: as in `orchestration/_TEMPLATE.md`, verbatim. Branch: `cu-b004-f-w4a-schema-core`.

**Skills:** typescript-pro (primary), zod-validation-expert, database-design
**Depends on:** B1
**Reads (context, do not edit):** `docs/decisions/0006-netbox-methodology-is-binding.md` (THE contract for this wave) · `docs/decisions/0004-reference-designation.md` (charset — the ADR is proposed; the charset regex below is the frozen part you implement) · `docs/decisions/0003-draft-semantics.md` (status vocabulary only)
**Files (exactly these):** `app/src/model/schema.ts` (chokepoint owner), `app/src/model/schema.test.ts`
**Goal:** the containment-and-lifecycle core of the Copper document model as zod schemas + inferred TS types, NetBox-shaped per ADR-0006. **Every field carries a `// netbox: <object>.<field>` comment or `// extension: <reason>` — a field with neither is a defect.**

Model (ids as opaque strings; no `_`/`%`/space in any generated identifier):
- `Site`; `Location` (recursive `parentId`; doubles as building/floor/room).
- `Rack`: `uHeight`, `status` (enum exactly: `reserved|available|planned|active|deprecated`).
- `DeviceType` **metadata only** (component templates are B4b): `manufacturer`, `model`, `slug`, `uHeight`, `isFullDepth`, `weight?`, `airflow?`.
- `Device` **basics only** (owned components are B4b): `deviceTypeId`, `siteId`/`locationId`, optional `rackId` + `position` (NUMERIC, half-U allowed) + `face` (`front|rear`), `status` (enum exactly: `planned|staged|active|offline|decommissioning|inventory|failed`), `designation?` (regex `^[A-Z0-9.:+=-]+$`).
- Status enums exported as named zod enums (B4b and later waves reuse them).

**Steps:**
1. Author the schemas in dependency order with the citation comments.
2. Tests: round-trip (`parse(serialize(x)) = x`) for a hand-built Site→Location→Rack→Device chain; RED cases: invalid device status, invalid rack status, `designation` containing `_`, unknown top-level keys rejected (`strict()`), `face` outside front/rear.
3. The meta-ratchet: a test that greps `schema.ts` asserting every `z.` field line carries `netbox:` or `extension:` (regex-based; crude is fine — it gates the habit and it will also gate B4b's additions to this file).
4. Gate; commit.

**Acceptance:** `pnpm vitest run app/src/model/schema.test.ts` green; all RED cases proven in tests.

**§6.4 mutation table (minimum):** (1) widen the designation regex to allow `_` in a scratch copy → charset test RED; (2) delete one `// netbox:` comment → meta-test RED; (3) add `failed` to the rack enum → rack-status test RED (proving the two enums are independent).

## Final: as `orchestration/_TEMPLATE.md` §Final — STOP and report. Name explicitly what you did NOT model (components, cables, extension layer, DesignDocument — they are B4b's, by design; IPAM — unscheduled).
