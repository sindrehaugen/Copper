# Batch 036 - V.Wave 1 - `poe-budget`

> **FRESH SESSION REQUIRED.** Run this wave in a **new chat / new agent with no prior context**. This file
> is fully self-contained - it is the only instruction you need. Do **not** carry state from a previous wave.
> One wave = one new session = one branch = one commit = one TAG audit.
>
> **Engine class:** Pro (Gemini Pro 1.5 in Antigravity).

1. **One wave = one branch = one commit.** Branch `cu-b036-v-w1-poe-budget` off current `main`. Squash everything into one commit.
2. **Verify before you act.**
3. **Modify only the files listed in `Files:`.**
4. **Minimal diff.**
5. **Acceptance gate:** `pnpm lint` clean · `pnpm typecheck` clean · `pnpm vitest run app/src/validation/poe-budget.test.ts` clean.
6. **Licence firewall (voids the wave if broken):** never open, quote, or port from `C:\Claude\EasySchematic\**`. 
7. **NCE is the store.**
8. **Secrets:** never commit tokens.
9. **Turbo-mode discipline:** commit on your branch is the last state-changing command.
10. **Craft gate:** functions small and single-purpose.
11. **Report format:** files changed, verbatim gate output, what you did NOT verify.

**Skills:** PoE Standards, Validation Logic.
**Depends on:** B30.
**Reads (context, do not edit):** `app/src/model/schema.ts` (for the B4b schema `Device`, `Cable`, `Port`).
**Files (exactly these - nothing else):**
- `app/src/validation/poe-budget.ts`
- `app/src/validation/poe-budget.test.ts`

**Goal:** Implement `validatePoEBudget(switchDevice: Device, connectedDevices: Device[], cables: Cable[])`. It must sum the PoE class power draws of all connected devices and ensure it does not exceed the `switchDevice`'s maximum PoE budget (if defined).

**Steps:**
1. In `app/src/validation/poe-budget.ts`, implement the validation function. It should return a result object `{ valid: boolean, totalDrawWatts: number, budgetWatts?: number, errors: string[] }`.
2. Map IEEE 802.3 classes to wattage: Class 1 (4.0W), Class 2 (7.0W), Class 3 (15.4W), Class 4 (30.0W), Class 5 (45.0W), Class 6 (60.0W), Class 7 (75.0W), Class 8 (90.0W).
3. If a device has a specific `allocatedDrawWatts` overriding the class, use that.
4. Sum the wattage and check against the switch.
5. In `app/src/validation/poe-budget.test.ts`, write synthetic tests verifying the budget calculation, over-budget scenarios, and fallback logic.

**Acceptance:** `pnpm lint && pnpm typecheck && pnpm vitest run app/src/validation/poe-budget.test.ts` clean.

## Final (the TAG gate - this is the ONLY way this wave reaches DONE):
Follow the standard final rules.
