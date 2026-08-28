# Batch 040 - V.Wave 5 - `hdcp-chain`

> **FRESH SESSION REQUIRED.** Run this wave in a **new chat / new agent with no prior context**. This file
> is fully self-contained - it is the only instruction you need. Do **not** carry state from a previous wave.
> One wave = one new session = one branch = one commit = one TAG audit.
>
> **Engine class:** Pro (Gemini Pro 1.5 in Antigravity).

1. **One wave = one branch = one commit.** Branch `cu-b040-v-w5-hdcp-chain` off current `main`. Squash everything into one commit.
2. **Verify before you act.**
3. **Modify only the files listed in `Files:`.**
4. **Minimal diff.**
5. **Acceptance gate:** `pnpm lint` clean · `pnpm typecheck` clean · `pnpm vitest run app/src/validation/hdcp-chain.test.ts` clean.
6. **Licence firewall (voids the wave if broken):** never open, quote, or port from `C:\Claude\EasySchematic\**`. 
7. **NCE is the store.**
8. **Secrets:** never commit tokens.
9. **Turbo-mode discipline:** commit on your branch is the last state-changing command.
10. **Craft gate:** functions small and single-purpose.
11. **Report format:** files changed, verbatim gate output, what you did NOT verify.

**Skills:** HDCP Standards, TypeScript, Validation.
**Depends on:** B29.
**Reads (context, do not edit):** `app/src/model/schema.ts` (for the `Device` schema).
**Files (exactly these - nothing else):**
- `app/src/validation/hdcp-chain.ts`
- `app/src/validation/hdcp-chain.test.ts`

**Goal:** Detect HDCP version downgrades along a signal chain (e.g. from an HDCP 2.2 source, through a switcher, to an HDCP 1.4 display). HDCP will automatically downgrade to the lowest version in the chain, which can cause 4K content to refuse to play. We want to warn the designer if a downgrade occurs.

**Steps:**
1. In `app/src/validation/hdcp-chain.ts`, implement `validateHDCPChain(source: Device, chain: Device[])`.
2. Find the HDCP version of the source (e.g. `source.hdcpVersion` string).
3. Find the lowest HDCP version among the devices in the chain. 
4. If the lowest version in the chain is lower than the source (e.g. '1.4' vs '2.2'), return a warning: `{ valid: false, message: 'HDCP downgrade detected...', lowestVersion: '1.4' }`.
5. In `app/src/validation/hdcp-chain.test.ts`, write tests verifying that a 2.2 source going to a 1.4 display triggers the warning, but a 1.4 source going to a 2.2 display does not.

**Acceptance:** `pnpm lint && pnpm typecheck && pnpm vitest run app/src/validation/hdcp-chain.test.ts` clean.

## Final (the TAG gate - this is the ONLY way this wave reaches DONE):
Follow the standard final rules.
