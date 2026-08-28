# Batch 030 - G.Wave 4 - `port-overrides`

> **FRESH SESSION REQUIRED.** Run this wave in a **new chat / new agent with no prior context**. This file
> is fully self-contained - it is the only instruction you need. Do **not** carry state from a previous wave.
> One wave = one new session = one branch = one commit = one TAG audit.
>
> **Engine class:** Pro (Gemini Pro 1.5 in Antigravity).

1. **One wave = one branch = one commit.** Branch `cu-b030-g-w4-port-overrides` off current `main`. Squash everything into one commit.
2. **Verify before you act.**
3. **Modify only the files listed in `Files:`.**
4. **Minimal diff.**
5. **Acceptance gate:** `pnpm lint` clean · `pnpm typecheck` clean · `pnpm vitest run app/src/model/port-overrides.test.ts` clean.
6. **Licence firewall (voids the wave if broken):** never open, quote, or port from `C:\Claude\EasySchematic\**`. 
7. **NCE is the store.**
8. **Secrets:** never commit tokens.
9. **Turbo-mode discipline:** commit on your branch is the last state-changing command.
10. **Craft gate:** functions small and single-purpose.
11. **Report format:** files changed, verbatim gate output, what you did NOT verify.

**Skills:** TypeScript, Data Modeling.
**Depends on:** B4b, B8.
**Reads (context, do not edit):** `app/src/model/schema.ts` (for the B4b schema of `DeviceType` and `Device`).
**Files (exactly these - nothing else):**
- `app/src/model/port-overrides.ts`
- `app/src/model/port-overrides.test.ts`

**Goal:** Implement the `portsOf` chain with NetBox instantiate-then-own semantics. When a device is instantiated from a `DeviceType`, it inherits the port templates. But if a `Device` has specifically authored overrides (or individual `Port` instances belonging to it), they overlay the template.

**Steps:**
1. In `app/src/model/port-overrides.ts`, implement a function `resolveDevicePorts(device: Device, deviceType: DeviceType)` that returns a fully resolved array of `Port` objects.
2. The logic: start with the `deviceType.frontPortTemplates` and `rearPortTemplates` (and other templates). Map them to resolved `Port` interfaces.
3. If the `device` object contains explicit `ports` (overrides), merge them by matching on the port `name`. The `device` port properties win.
4. In `app/src/model/port-overrides.test.ts`, write tests to verify template inheritance, and verify that overriding a port's label or type successfully masks the template value.

**Acceptance:** `pnpm lint && pnpm typecheck && pnpm vitest run app/src/model/port-overrides.test.ts` clean.

## Final (the TAG gate - this is the ONLY way this wave reaches DONE):
Follow the standard final rules.
