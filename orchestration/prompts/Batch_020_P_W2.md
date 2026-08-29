# Batch 020 - P.Wave 2 - ff-nce-client

> **FRESH SESSION REQUIRED.** Run this wave in a **new chat / new agent with no prior context**. This file
> is fully self-contained - it is the only instruction you need. Do **not** carry state from a previous wave.
> One wave = one new session = one branch = one commit = one TAG audit.
>
> **Engine class:** Flash (Gemini Flash 3.7 High in Antigravity, turbo mode).

1. **One wave = one branch = one commit.** Branch cu-b020-p-w2-bff-nce-client off current main. Squash everything into one commit.
2. **Verify before you act.**
3. **Modify only the files listed in Files:.**
4. **Minimal diff.**
5. **Acceptance gate:** pnpm lint clean · pnpm typecheck clean · pnpm vitest run bff/src/nce-client clean.
6. **Licence firewall (voids the wave if broken):** never open, quote, or port from C:\Claude\EasySchematic\**.
7. **NCE is the store.**
8. **Secrets:** never commit tokens, DSNs, or .env values.
9. **Turbo-mode discipline:** commit on your branch is the last state-changing command.
10. **Craft gate:** functions small and single-purpose.
11. **Report format:** files changed, verbatim gate output, what you did NOT verify.

**Skills:** Node.js, fetch, HMAC-SHA256, Zod.
**Depends on:** B12, B19 (B19 provides BffConfig).
**Reads (context, do not edit):** bff/src/index.ts (for BffConfig), app/src/model/schema.ts (for target shapes).
**Files (exactly these - nothing else):**
- bff/package.json (add zod)
- bff/src/nce-client/index.ts (the client implementation)
- bff/src/nce-client/index.test.ts (tests)
- bff/src/nce-client/hmac.ts (HMAC utility)
- bff/src/nce-client/hmac.test.ts (HMAC tests)

**Goal:** Implement a strictly typed BFF-to-NCE REST client with HMAC-SHA256 authentication and Zod response validation.

**Steps:**
1. In bff/package.json, add zod to dependencies.
2. Create bff/src/nce-client/hmac.ts exporting a function that computes X-NCE-Timestamp and canonical signature: METHOD\nPATH\nTIMESTAMP[\nSHA256(body)]. Use standard Node.js crypto module.
3. Create bff/src/nce-client/index.ts. Export a client class or factory that takes BffConfig.
4. Implement getTopology(namespace: string): Promise<DesignDocument>. It calls GET /api/system-design/topology?namespace={namespace}.
5. Implement validateDesign(namespace: string, designLabel: string): Promise<{passed: boolean, reasons: string[]}>. It calls POST /api/system-design/validate with JSON body { "namespace": namespace, "design_label": designLabel }.
6. Use zod to validate responses. If the API returns HTTP 403 / -32005, throw a distinct GovernanceDisabledError.

**Acceptance:** pnpm lint && pnpm typecheck && pnpm vitest run bff/src/nce-client clean.
Ensure to test the canonicalization explicitly in hmac.test.ts to prevent middleware mismatches.

## Final (the TAG gate - this is the ONLY way this wave reaches DONE):
Follow the standard final rules.
