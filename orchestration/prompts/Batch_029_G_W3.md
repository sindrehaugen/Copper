# Batch 029 - G.Wave 3 - `validate-join`

> **FRESH SESSION REQUIRED.** Run this wave in a **new chat / new agent with no prior context**. This file
> is fully self-contained - it is the only instruction you need. Do **not** carry state from a previous wave.
> One wave = one new session = one branch = one commit = one TAG audit.
>
> **Engine class:** Pro (Gemini Pro 1.5 in Antigravity).

1. **One wave = one branch = one commit.** Branch `cu-b029-g-w3-validate-join` off current `main`. Squash everything into one commit.
2. **Verify before you act.**
3. **Modify only the files listed in `Files:`.**
4. **Minimal diff.**
5. **Acceptance gate:** `pnpm lint` clean · `pnpm typecheck` clean · `pnpm vitest run app/src/model/validate-join.test.ts` clean.
6. **Licence firewall (voids the wave if broken):** never open, quote, or port from `C:\Claude\EasySchematic\**`. 
7. **NCE is the store.**
8. **Secrets:** never commit tokens.
9. **Turbo-mode discipline:** commit on your branch is the last state-changing command.
10. **Craft gate:** functions small and single-purpose.
11. **Report format:** files changed, verbatim gate output, what you did NOT verify.

**Skills:** TypeScript, Domain Logic.
**Depends on:** B28.
**Reads (context, do not edit):** `app/src/model/connector-accepts.ts`.
**Files (exactly these - nothing else):**
- `app/src/model/validate-join.ts`
- `app/src/model/validate-join.test.ts`

**Goal:** Implement a validation function `validateJoin(source: Port, target: Port)` that checks if a source port can plug into a target port based on `canConnect`. It must return a string literal: `'direct' | 'adapter' | 'incompatible' | 'unknown'`. **It must never reject**; it simply returns the status (a drawing is documentation).

**Steps:**
1. In `app/src/model/validate-join.ts`, implement `validateJoin(source: Port, target: Port)`.
2. Extract the `signalType` and `connectorType` from both ports.
3. If they are exactly the same or `canConnect` is true, return `'direct'`.
4. If the `signalType` matches but `connectorType` is incompatible, assume an adapter is possible and return `'adapter'`.
5. If the `signalType` differs (and no special bridge logic exists), return `'incompatible'`.
6. If any type is unknown/missing, return `'unknown'`.
7. In `app/src/model/validate-join.test.ts`, write synthetic tests verifying each of the four return values.

**Acceptance:** `pnpm lint && pnpm typecheck && pnpm vitest run app/src/model/validate-join.test.ts` clean.

## Final (the TAG gate - this is the ONLY way this wave reaches DONE):
Follow the standard final rules.
