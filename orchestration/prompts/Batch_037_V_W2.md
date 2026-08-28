# Batch 037 - V.Wave 2 - `channel-length`

> **FRESH SESSION REQUIRED.** Run this wave in a **new chat / new agent with no prior context**. This file
> is fully self-contained - it is the only instruction you need. Do **not** carry state from a previous wave.
> One wave = one new session = one branch = one commit = one TAG audit.
>
> **Engine class:** Pro (Gemini Pro 1.5 in Antigravity).

1. **One wave = one branch = one commit.** Branch `cu-b037-v-w2-channel-length` off current `main`. Squash everything into one commit.
2. **Verify before you act.**
3. **Modify only the files listed in `Files:`.**
4. **Minimal diff.**
5. **Acceptance gate:** `pnpm lint` clean · `pnpm typecheck` clean · `pnpm vitest run app/src/validation/channel-length.test.ts` clean.
6. **Licence firewall (voids the wave if broken):** never open, quote, or port from `C:\Claude\EasySchematic\**`. 
7. **NCE is the store.**
8. **Secrets:** never commit tokens.
9. **Turbo-mode discipline:** commit on your branch is the last state-changing command.
10. **Craft gate:** functions small and single-purpose.
11. **Report format:** files changed, verbatim gate output, what you did NOT verify.

**Skills:** Network Standards (EN 50173 / TIA-568), TypeScript, Validation.
**Depends on:** B29.
**Reads (context, do not edit):** `app/src/model/schema.ts` (for the `Cable` schema).
**Files (exactly these - nothing else):**
- `app/src/validation/channel-length.ts`
- `app/src/validation/channel-length.test.ts`

**Goal:** Validate channel lengths against EN 50173 / NEK 700 limits (TIA-568 is a fallback, see ADR-0008). Specifically, refuse a 140m copper run, while allowing standard 90m permanent link / 100m channel lengths, and longer limits for fiber or specific active cables.

**Steps:**
1. In `app/src/validation/channel-length.ts`, implement `validateChannelLength(cable: Cable, signalType: string)`.
2. Determine the limit based on the `cable.type` (e.g. `cat6a`, `cat6`, `smf`, `mmf`, `hdmi`, `active-hdmi`, `hdbaset`).
3. For base-T copper (Cat5e/6/6a), the limit is 100m. 
4. For HDBaseT on Cat6a, the limit is typically 100m. For HDBaseT on Cat6, 70m.
5. If the cable is longer than the limit, return a validation error. If `cable.length` is undefined, return a warning or assume it's unverified (valid but marked `unverified: true`).
6. In `app/src/validation/channel-length.test.ts`, write synthetic tests verifying limits (e.g. 140m Cat6a fails, 90m Cat6a passes, 300m SMF passes, etc.).

**Acceptance:** `pnpm lint && pnpm typecheck && pnpm vitest run app/src/validation/channel-length.test.ts` clean.

## Final (the TAG gate - this is the ONLY way this wave reaches DONE):
Follow the standard final rules.
