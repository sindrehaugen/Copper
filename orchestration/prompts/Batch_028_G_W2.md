# Batch 028 - G.Wave 2 - `connector-accepts-rebuild`

> **FRESH SESSION REQUIRED.** Run this wave in a **new chat / new agent with no prior context**. This file
> is fully self-contained - it is the only instruction you need. Do **not** carry state from a previous wave.
> One wave = one new session = one branch = one commit = one TAG audit.
>
> **Engine class:** Pro (Gemini Pro 1.5 in Antigravity).

1. **One wave = one branch = one commit.** Branch `cu-b028-g-w2-connector-accepts-rebuild` off current `main`. Squash everything into one commit.
2. **Verify before you act.**
3. **Modify only the files listed in `Files:`.**
4. **Minimal diff.**
5. **Acceptance gate:** `pnpm lint` clean · `pnpm typecheck` clean · `pnpm vitest run app/src/model/connector-accepts.test.ts` clean.
6. **Licence firewall (voids the wave if broken):** never open, quote, or port from `C:\Claude\EasySchematic\**`. **DO NOT OPEN ANY PRE-EXISTING COMPATIBILITY FILE - THIS IS A CLEAN ROOM REBUILD.**
7. **NCE is the store.**
8. **Secrets:** never commit tokens.
9. **Turbo-mode discipline:** commit on your branch is the last state-changing command.
10. **Craft gate:** functions small and single-purpose.
11. **Report format:** files changed, verbatim gate output, what you did NOT verify.

**Skills:** AV Design, TypeScript.
**Depends on:** B27.
**Reads (context, do not edit):** `app/src/model/signal-classes.ts` (for the SignalClass list).
**Files (exactly these - nothing else):**
- `app/src/model/connector-accepts.ts`
- `app/src/model/connector-accepts.test.ts`

**Goal:** Build a compatibility table from first principles (clean-room). Define what signal types + connector types can plug into each other (e.g. HDMI <-> HDMI, RJ45 <-> RJ45, HDBaseT <-> RJ45, etc).

**Steps:**
1. In `app/src/model/connector-accepts.ts`, define a `ConnectorCompatibility` module or data structure. It must map `(signalType, connectorType)` to a list of compatible `(signalType, connectorType)` pairs or represent the relationship as a table.
2. Implement approximately 50 common AV combinations based on standard industry knowledge (e.g., Audio: XLR, TRS, RCA, Phoenix; Video: HDMI, DisplayPort, SDI; Control: RS-232/DB9, Phoenix; Network: RJ45; Power: IEC, PowerCon, Phoenix, etc).
3. In `app/src/model/connector-accepts.test.ts`, write tests verifying that basic compatible pairs return true, and obviously incompatible pairs return false.

**Acceptance:** `pnpm lint && pnpm typecheck && pnpm vitest run app/src/model/connector-accepts.test.ts` clean.

## Final (the TAG gate - this is the ONLY way this wave reaches DONE):
Follow the standard final rules.
