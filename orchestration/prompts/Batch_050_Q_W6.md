# Batch 050 - Q.W6: rig-ratchet

> **FRESH SESSION REQUIRED.** Run this wave in a **new chat / new agent with no prior context**. This file
> is fully self-contained - it is the only instruction you need. Do **not** carry state from a previous wave.
> One wave = one new session = one branch = one commit = one TAG audit.
>
> **Engine class:** Flash (Gemini Flash 3.7 High in Antigravity, turbo mode).

1. **One wave = one branch = one commit.** Branch `cu-b050-q-w6-rig-ratchet` off current `main`. Squash everything into one commit.
2. **Verify before you act.**
3. **Modify only the files listed in `Files:`.**
4. **Minimal diff.**
5. **Acceptance gate:** `pnpm lint` clean · `pnpm typecheck` clean · `.github/workflows/ci.yml` is valid.
6. **Licence firewall (voids the wave if broken):** never open, quote, or port from `C:\Claude\EasySchematic\**`.
7. **NCE is the store.**
8. **Secrets:** never commit tokens, DSNs, or `.env` values.
9. **Turbo-mode discipline:** commit on your branch is the last state-changing command.
10. **Craft gate:** functions small and single-purpose.
11. **Report format:** files changed, verbatim gate output, what you did NOT verify.

**Skills:** GitHub Actions, Node.js scripts, vitest.
**Depends on:** B48.
**Reads (context, do not edit):** `app/src/router/quality.ts`
**Files (exactly these - nothing else):**
- `.github/workflows/ci.yml` (add the rig-ratchet step)
- `scripts/rig-ratchet.mjs` (the script that evaluates the floor)
- `scripts/rig-ratchet.test.mjs` (test for the script)
- `package.json` (add scripts if needed)

**Goal:** Wire B48 scores across the 15 fixture sheets into CI with a floor; regressions below the floor must fail the build.

**Steps:**
1. Create `scripts/rig-ratchet.mjs`. It should load the 15 fixture sheets (mocked as an array of paths or IDs for now, or point to an existing fixture directory if present, e.g. `tests/fixtures/*.json`), evaluate the routing quality score using `evaluateQuality` from `app/src/router/quality.ts`, and compare the total score against a hardcoded `const FLOOR_SCORE = X;`. If the score is > `FLOOR_SCORE` (meaning worse, since it's an ugliness score), the script exits with code 1.
2. Create `scripts/rig-ratchet.test.mjs` to test the script logic.
3. In `.github/workflows/ci.yml`, add a step `pnpm run check:rig` after the tests. Ensure it only runs on Ubuntu (`ubuntu-latest`) as cross-platform score determinism is NOT claimed.
4. Add the `check:rig` script to `package.json` pointing to `node scripts/rig-ratchet.mjs`.

**Acceptance:** `pnpm lint && pnpm typecheck && node scripts/rig-ratchet.test.mjs`

## Final (the TAG gate - this is the ONLY way this wave reaches DONE):
Return a summary of what you did. Include your §6.4 mutation test results (mutate the floor score to be extremely low, e.g., 0, and verify the script fails).
