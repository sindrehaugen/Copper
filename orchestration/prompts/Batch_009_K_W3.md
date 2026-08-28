# Batch 009 - K.Wave 3 - `dtl-walker`

> **FRESH SESSION REQUIRED.** Run this wave in a **new chat / new agent with no prior context**. This file
> is fully self-contained - it is the only instruction you need. Do **not** carry state from a previous wave.
> One wave = one new session = one branch = one commit = one TAG audit.
>
> **Engine class:** Flash (Gemini Flash 3.7 High in Antigravity, turbo mode).

1. **One wave = one branch = one commit.** Branch `cu-b009-k-w3-dtl-walker` off current `main`. Squash everything into one commit.
2. **Verify before you act.**
3. **Modify only the files listed in `Files:`.**
4. **Minimal diff.**
5. **Acceptance gate:** `pnpm lint` clean · `pnpm typecheck` clean · `pnpm vitest run catalog/src/walker.test.ts` clean.
6. **Licence firewall (voids the wave if broken):** never open, quote, or port from `C:\Claude\EasySchematic\**`.
7. **NCE is the store.**
8. **Secrets:** never commit tokens.
9. **Turbo-mode discipline:** commit on your branch is the last state-changing command.
10. **Craft gate:** functions small and single-purpose.
11. **Report format:** files changed, verbatim gate output, what you did NOT verify.

**Skills:** Node.js, File system traversal.
**Depends on:** B8.
**Reads (context, do not edit):** `catalog/src/parse.ts` (for the B8 parser signature).
**Files (exactly these - nothing else):**
- `catalog/src/walker.ts` (the walker)
- `catalog/src/walker.test.ts` (tests)

**Goal:** Traverse a directory of Device Type Library YAMLs, run the B8 parser on each, and build a `Map<string, DeviceType>` keyed by `{vendor_slug}-{model_slug}`.

**Steps:**
1. In `catalog/src/walker.ts`, implement `walkDirectory(dirPath: string): Promise<Map<string, DeviceType>>` (or synchronous equivalent).
2. It must recursively find all `.yaml` and `.yml` files in `dirPath`.
3. For each file, read it and pass the string to B8's `parseDeviceType`.
4. The key should be constructed from the parsed `vendor` (slugified) and `model` (slugified).
5. In `catalog/src/walker.test.ts`, write tests with a mock directory structure (using `memfs` or real files in `catalog/tests/fixtures/`) and verify the resulting Map.

**Acceptance:** `pnpm lint && pnpm typecheck && pnpm vitest run catalog/src/walker.test.ts` clean.

## Final (the TAG gate - this is the ONLY way this wave reaches DONE):
Follow the standard final rules.
