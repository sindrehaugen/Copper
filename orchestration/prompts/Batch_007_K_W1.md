# Batch 007 - K.Wave 1 - `dtl-vendor`

> **FRESH SESSION REQUIRED.** Fully self-contained brief; one wave = one session = one branch = one commit = one TAG (or T1 bypass).
> **Engine class:** Flash (Gemini Flash 3.7 High, turbo). Unwritten design decision -> STOP and report.

Rules 1-11: as in `orchestration/_TEMPLATE.md`, verbatim. Branch: `cu-b007-k-w1-dtl-vendor`.

**Skills:** nodejs-best-practices
**Depends on:** B1
**Reads (context, do not edit):** `app/tests/fixtures/av-fasit/` (the 15 fixture sheets)
**Files (exactly these):** `catalog/vendors.json` (new)
**Goal:** Extract unique vendor strings from all devices in the 15 fixture sheets, outputting them as an array of strings in `catalog/vendors.json`, sorted alphabetically.

**Steps:**
1. Write a scratch script (do not commit the script) to read all `.json` files in `app/tests/fixtures/av-fasit/`. Note: they don't have `.easyschematic.json` extension anymore, they are just `.json` or similar? Wait, they are currently scrubbed from Git but they exist as `.json` or `.easyschematic.json` on disk depending on what the B6 coder did. Just read the files and extract the `make` or `manufacturer` field from each device in `devices` array.
2. Deduplicate, sort alphabetically, and write to `catalog/vendors.json` formatted cleanly.
3. Validate JSON using `node -e "require('./catalog/vendors.json')"`.
4. Gate; commit.

**Acceptance:** `catalog/vendors.json` contains a valid JSON array of strings.

**§6.4 mutation table:** (1) mutate a vendor name in the JSON, fail a hypothetical `jq` validation step (or just manual verification).

## Final: as `orchestration/_TEMPLATE.md` §Final.