# Batch 005 — F.Wave 5 — `es-reader`

> **FRESH SESSION REQUIRED.** Fully self-contained brief; one wave = one session = one branch = one commit = one TAG.
> **Engine class:** Flash (Gemini Flash 3.7 High, turbo). Unwritten design decision → STOP and report.

Rules 1–11: as in `orchestration/_TEMPLATE.md`, verbatim. Branch: `cu-b005-f-w5-es-reader`.

**Skills:** typescript-pro (primary), zod-validation-expert
**Depends on:** B4
**Reads (context, do not edit):** `app/src/model/schema.ts` · the steps-ai format reader `C:\Users\SindreLøvlieHaugen\Documents\systemer\steps-ai\frontend\src\lysning\romtegning\model\fraEasySchematic.js` (**PORT-list file: Bravo-owned, states in-file that no upstream lines were copied — you are porting Bravo's own reader, translating JS→TS and Norwegian→English identifiers**)
**Files (exactly these):** `app/src/exchange/easyschematic/read.ts` (new), `app/src/exchange/easyschematic/read.test.ts` (new), `app/tests/fixtures/av-fasit/` (copy exactly TWO `.easyschematic.json` fixture sheets from `steps-ai\frontend\tests\fixtures\av-fasit\` — pick the two smallest)

⚠ **Licence firewall reminder (template rule 6):** you are reading a FILE FORMAT. Do not open anything under `C:\Claude\EasySchematic\` and do not fetch its source. The one steps-ai file named above is the only external source you may read, and only to port it.

**Goal:** `readEasySchematic(json: unknown): { document: DesignDocument, report: ImportReport }` — parse an EasySchematic drawing file into the Copper model. **Lossy or unmapped fields are counted and named in `report`, never silently dropped** (`report.unmappedFields: Record<string, number>`, `report.skippedObjects: {kind, id, reason}[]`). Devices→Device (+materialized ports), wires→Cable (2 terminations; a wire whose endpoint is missing → skipped with reason), rooms/zones→Location, racks→Rack. Signal-type strings land in the extension layer as raw strings (`report` counts distinct values; mapping to SignalClass is a later wave — do NOT invent a mapping).

**Steps:**
1. Read the two fixtures and the steps-ai reader; write down (in the test file header) the format's shape as you verified it from the fixtures themselves.
2. Implement `read.ts` as pure functions, zod-parsing the foreign format leniently (`passthrough`) and the output strictly (B4 schemas).
3. Tests per fixture: exact device/port/cable/room counts (hand-count them from the JSON first and cite the numbers in comments), spot-check one known device's ports, `report` assertions: no unmapped field goes uncounted (mutate: add a fake field to a fixture copy → its name appears in `unmappedFields`).
4. Gate; commit.

**Acceptance:** both fixtures parse; counts match hand-verified numbers; `pnpm vitest run app/src/exchange/easyschematic/read.test.ts` green.

**§6.4 mutation table (minimum):** (1) delete the wire-endpoint guard in a scratch copy → dangling-wire test RED; (2) drop a device from a fixture copy → count test RED; (3) silently swallow unknown fields → unmapped-fields test RED.

## Final: as `orchestration/_TEMPLATE.md` §Final. Name what you did NOT verify (the 13 uncopied fixtures; any format features the two fixtures don't exercise — list which you saw referenced in the reader but never hit).
