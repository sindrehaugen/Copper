# ADR-0011: Identity, session, and tenancy — who is using Copper, and how NCE knows

> **Status:** enforced  — 🛑 **HS-9: Sindre signs this before B75 dispatches; B34+ (all writes) depend on it** · **Date:** 2026-08-28 · **Deciders:** Sindre

## Context

The audit found this hole blocking: the plan shipped a "session stub" (B19) that nothing ever replaced. There was no user model, no login mechanism, no answer to where the browser session gets its `namespace_id`, and no identity on NCE writes — while B35 writes `action_approval_queue` rows that require a human identity, and NCE's REST auth is a server-held HMAC key that must never reach the browser. Bravo runs on Microsoft: Entra ID accounts on the machines, D365 integration, Azure readiness work on the Portal.

## Decision (proposed)

1. **Identity provider: Microsoft Entra ID** (the tenant Bravo already lives in). The BFF is a confidential OIDC client using authorization-code + PKCE. No passwords, no Copper-local accounts, ever.
2. **Session: signed, HttpOnly, `SameSite=Strict` cookie** minted by the BFF after OIDC login — stateless (signed/encrypted claims) so the BFF stays storeless. Short TTL with silent renewal. **CSRF posture:** SameSite=Strict plus an Origin/Sec-Fetch-Site check on every mutating route.
3. **Tenancy:** the session carries the user's **allowed namespace set**, mapped from Entra group membership via BFF configuration (env/file; an NCE-held mapping can replace it later). The shell offers a tenant switcher over that set; **every BFF→NCE call validates the requested `namespace_id` against the session's set server-side** — the client never picks a namespace the BFF hasn't authorized. Without this the BFF is a cross-tenant proxy.
4. **Actor propagation:** the user's UPN is passed as `actor` on every NCE mutation (m6 contract Rev 2) and recorded in NCE's event payloads / approval-queue rows. The HMAC key authenticates the *BFF*; `actor` attributes the *human*. The key's blast radius (today: admin-grade REST access) is named in the seam audit; least-privilege scoping of NCE API keys is flagged as NCE-side future work.
5. **Secrets:** `NCE_API_KEY` and the cookie-signing key live only in BFF env/secret files (Key Vault in deployed environments, ADR-0012); a CI ratchet asserts neither appears in the client bundle.

## Consequences

- New wave **B75 (U lane, T3): auth-session** — OIDC flow, session cookie, tenant mapping, CSRF checks, bundle-secret ratchet. B34 (write-through), B35 (promote) and B70 (module proxy) gain `dep: B75`.
- The m6 contract table gains the optional `actor` parameter **before** ML freezes the write tools.
- Local dev needs a dev-mode identity seam (env-configured fake user) so coder agents can run the BFF without Entra credentials — part of B19's config seams, stated in its brief.

## What would reopen this

A customer-facing (non-Bravo-staff) Copper audience — that adds external identity, consent surfaces, and a real authorization model beyond namespace sets.

