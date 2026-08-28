# Batch 027 - G.Wave 1 - `signal-classes`

> **FRESH SESSION REQUIRED.** Run this wave in a **new chat / new agent with no prior context**. This file
> is fully self-contained - it is the only instruction you need. Do **not** carry state from a previous wave.
> One wave = one new session = one branch = one commit = one TAG audit.
>
> **Engine class:** Flash (Gemini Flash 3.7 High in Antigravity, turbo mode).

1. **One wave = one branch = one commit.** Branch `cu-b027-g-w1-signal-classes` off current `main`. Squash everything into one commit.
2. **Verify before you act.**
3. **Modify only the files listed in `Files:`.**
4. **Minimal diff.**
5. **Acceptance gate:** `pnpm lint` clean · `pnpm typecheck` clean · `pnpm vitest run app/src/model/signal-classes.test.ts` clean.
6. **Licence firewall (voids the wave if broken):** never open, quote, or port from `C:\Claude\EasySchematic\**`.
7. **NCE is the store.**
8. **Secrets:** never commit tokens.
9. **Turbo-mode discipline:** commit on your branch is the last state-changing command.
10. **Craft gate:** functions small and single-purpose.
11. **Report format:** files changed, verbatim gate output, what you did NOT verify.

**Skills:** Node.js, TypeScript.
**Depends on:** B4b.
**Reads (context, do not edit):** `app/src/model/schema.ts` (for context on how types are defined).
**Files (exactly these - nothing else):**
- `app/src/model/signal-classes.ts`
- `app/src/model/signal-classes.test.ts`

**Goal:** Implement `SIGNAL_CLASSES` port (our own clean list, e.g. AUDIO, VIDEO, CONTROL, NETWORK, POWER) and the three-independent-facts port model (`type`, `signalType`, `connectorType`) as types/enums.

**Steps:**
1. Create `app/src/model/signal-classes.ts`.
2. Define a `SignalClass` enum or string union (e.g. `AUDIO`, `VIDEO`, `CONTROL`, `NETWORK`, `POWER`, `RF`, `UNKNOWN`).
3. Define the three-facts port interface `PortFacts { type: string; signalType?: string; connectorType?: string; }`.
4. Create tests in `app/src/model/signal-classes.test.ts` verifying the types and any helper functions you add (e.g. a validator).

**Acceptance:** `pnpm lint && pnpm typecheck && pnpm vitest run app/src/model/signal-classes.test.ts` clean.

## Final (the TAG gate - this is the ONLY way this wave reaches DONE):
Follow the standard final rules.
