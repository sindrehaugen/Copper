# Batch 008 - K.Wave 2 - `dtl-parser`

> **FRESH SESSION REQUIRED.** Run this wave in a **new chat / new agent with no prior context**. This file
> is fully self-contained - it is the only instruction you need. Do **not** carry state from a previous wave.
> One wave = one new session = one branch = one commit = one TAG audit.
>
> **Engine class:** Flash (Gemini Flash 3.7 High in Antigravity, turbo mode).

1. **One wave = one branch = one commit.** Branch `cu-b008-k-w2-dtl-parser` off current `main`. Squash everything into one commit.
2. **Verify before you act.**
3. **Modify only the files listed in `Files:`.**
4. **Minimal diff.**
5. **Acceptance gate:** `pnpm lint` clean · `pnpm typecheck` clean · `pnpm vitest run catalog/src/parse.test.ts` clean.
6. **Licence firewall (voids the wave if broken):** never open, quote, or port from `C:\Claude\EasySchematic\**`.
7. **NCE is the store.**
8. **Secrets:** never commit tokens.
9. **Turbo-mode discipline:** commit on your branch is the last state-changing command.
10. **Craft gate:** functions small and single-purpose.
11. **Report format:** files changed, verbatim gate output, what you did NOT verify.

**Skills:** Node.js, YAML parsing (`js-yaml`).
**Depends on:** B4b, B7.
**Reads (context, do not edit):** `app/src/model/schema.ts` (for B4 DeviceType schema).
**Files (exactly these - nothing else):**
- `catalog/package.json` (add `js-yaml` and `@types/js-yaml` if needed)
- `catalog/src/parse.ts` (the parser)
- `catalog/src/parse.test.ts` (tests)

**Goal:** Parse NetBox Device Type Library YAML (interfaces, front-ports, rear-ports, console, power, module-bays, u_height, is_full_depth, weight, airflow) into the B4 `DeviceType` model. Unknown keys must be surfaced, not swallowed.

**Steps:**
1. In `catalog/package.json`, add `js-yaml`.
2. In `catalog/src/parse.ts`, implement `parseDeviceType(yamlString: string): { deviceType: DeviceType, unknownKeys: string[] }`.
3. Map the YAML arrays/objects to `DeviceType` components (using the schema from `app/src/model/schema.ts`).
4. In `catalog/src/parse.test.ts`, write tests with 5 inline YAML fixtures (or read from real files if they exist in `catalog/tests/fixtures/`) and verify the parsed `DeviceType` structure and `unknownKeys`.
5. Ensure malformed YAML throws an error (RED).

**Acceptance:** `pnpm lint && pnpm typecheck && pnpm vitest run catalog/src/parse.test.ts` clean.

## Final (the TAG gate - this is the ONLY way this wave reaches DONE):
Follow the standard final rules.
