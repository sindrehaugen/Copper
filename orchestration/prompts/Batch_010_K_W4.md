# Batch 010 - K.Wave 4 - `catalog-memory`

> **FRESH SESSION REQUIRED.** Run this wave in a **new chat / new agent with no prior context**. This file
> is fully self-contained - it is the only instruction you need. Do **not** carry state from a previous wave.
> One wave = one new session = one branch = one commit = one TAG audit.
>
> **Engine class:** Flash (Gemini Flash 3.7 High in Antigravity, turbo mode).

1. **One wave = one branch = one commit.** Branch `cu-b010-k-w4-catalog-memory` off current `main`. Squash everything into one commit.
2. **Verify before you act.**
3. **Modify only the files listed in `Files:`.**
4. **Minimal diff.**
5. **Acceptance gate:** `pnpm lint` clean · `pnpm typecheck` clean · `pnpm vitest run catalog/src/registry.test.ts` clean.
6. **Licence firewall (voids the wave if broken):** never open, quote, or port from `C:\Claude\EasySchematic\**`.
7. **NCE is the store.**
8. **Secrets:** never commit tokens.
9. **Turbo-mode discipline:** commit on your branch is the last state-changing command.
10. **Craft gate:** functions small and single-purpose.
11. **Report format:** files changed, verbatim gate output, what you did NOT verify.

**Skills:** Node.js.
**Depends on:** B9.
**Reads (context, do not edit):** `catalog/src/walker.ts` (for the B9 walker output).
**Files (exactly these - nothing else):**
- `catalog/src/registry.ts` (the registry)
- `catalog/src/registry.test.ts` (tests)
- `catalog/src/index.ts` (exporting the public API)

**Goal:** Create an in-memory global registry that holds the output of B9, providing O(1) lookups by `vendor_slug-model_slug`.

**Steps:**
1. In `catalog/src/registry.ts`, implement `CatalogRegistry` class/module.
2. It should have `initialize(dirPath: string): Promise<void>` which calls B9's `walkDirectory` and stores the Map.
3. Provide `getDeviceType(id: string): DeviceType | undefined`.
4. Provide `getAllDeviceTypes(): DeviceType[]`.
5. In `catalog/src/registry.test.ts`, write tests verifying initialization and lookups.
6. In `catalog/src/index.ts`, export the public API of the catalog module (`CatalogRegistry`, `getDeviceType`, etc).

**Acceptance:** `pnpm lint && pnpm typecheck && pnpm vitest run catalog/src/registry.test.ts` clean.

## Final (the TAG gate - this is the ONLY way this wave reaches DONE):
Follow the standard final rules.
