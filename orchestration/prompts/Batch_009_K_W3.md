# Batch 009 - K.W3: av-authoring-format

> **FRESH SESSION REQUIRED.**
> **Engine class:** Pro.

1. **One wave = one branch = one commit.** Branch cu-b009-k-w3-av-authoring-format off current main. Squash everything into one commit.
2. **Modify only the files listed in Files:.**
3. **Acceptance gate:** pnpm test clean.

**Files:**
- catalog/bravo/README.md (CC0 declaration)
- catalog/schema/copper-extensions.schema.json (JSON schema for the extensions)
- catalog/scripts/validate.mjs (validation script)
- catalog/scripts/validate.test.mjs (test script)
- .github/workflows/ci.yml (add CI step)
- package.json (add scripts if needed)

**Goal:**
Define the Bravo AV device-type format. It is exactly the DTL format PLUS a copper_extensions key at the root.
The copper_extensions key should contain per-port signal classes.
The goal is to ensure the authoring format is validated in CI. Upstream contribution is as simple as stripping copper_extensions.

**Steps:**
1. Create catalog/schema/copper-extensions.schema.json defining the JSON Schema for the copper_extensions block (it should map port names to signal classes or similar properties).
2. Create catalog/scripts/validate.mjs that reads a YAML file, parses it (can use the B8 parser from catalog/src/parse.ts or just js-yaml), and validates it against both the DTL schema (if we have one, or just assume valid DTL for now) AND the copper_extensions.schema.json using a schema validator like jv.
3. Create catalog/scripts/validate.test.mjs that proves validation works on a valid and invalid sample (you can write small inline YAML strings in the test).
4. Add catalog/bravo/README.md with a CC0 declaration for the Bravo format.
5. Add pnpm run check:catalog to .github/workflows/ci.yml and package.json to run the validator on all files in catalog/bravo/. (There are no files yet, so handle an empty glob or create a dummy file for the test).

**Acceptance:** pnpm run check:catalog passes and pnpm test passes.
