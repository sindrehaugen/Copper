# Deployment & Secret Architecture (Contract-D)

This document describes the deployment architecture and secret management strategy for Copper (`copper-bff` and `copper-web`) per **Contract-D** and Batch 153 (DX.W4).

---

## 1. Architectural Overview

Copper is deployed as a dual-container workload alongside the NCE stack:
- **`copper-bff`**: Node.js Backend-for-Frontend (Hono) serving `/api/*`, managing session cookies, HMAC authentication to NCE admin REST (`http://nce-admin:8003`), and tenancy isolation.
- **`copper-web`**: Static web client served behind Caddy.
- **Single Origin**: Caddy routes `/` to `copper-web`, `/api/*` to `copper-bff`, and `/admin*` to `nce-admin` so the browser operates against a single origin without CORS overhead.

---

## 2. Docker Compose Secrets Configuration

Per Contract-D, secrets are passed to containers using Docker Secrets (`*_FILE` mounts) mounted in memory (e.g., `/run/secrets/*`), preventing secrets from leaking into container images or process listings.

> **Note on `docker-compose.yml`**:
> `docker-compose.yml` is owned by the NCE repository. The compose secrets block below defines the contract for running Copper under the `copper` profile:

```yaml
services:
  copper-bff:
    image: ghcr.io/sindrehaugen/copper-bff:latest
    container_name: copper-bff
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - NCE_BASE_URL=http://nce-admin:8003
      - COOKIE_SECRET_FILE=/run/secrets/cookie_secret
      - NCE_API_KEY_FILE=/run/secrets/nce_api_key
      - ENTRA_CLIENT_SECRET_FILE=/run/secrets/entra_client_secret
      - PORT=8005
    secrets:
      - cookie_secret
      - nce_api_key
      - entra_client_secret
    networks:
      - nce-network
    profiles:
      - copper

secrets:
  cookie_secret:
    file: ./secrets/cookie_secret.txt
  nce_api_key:
    file: ./secrets/nce_api_key.txt
  entra_client_secret:
    file: ./secrets/entra_client_secret.txt
```

---

## 3. Fail-Closed Secret Reader (`bff/src/config.ts`)

The BFF secrets reader adheres to strict security invariants to prevent silent failure modes:

### Supported Secret Mounts
- `COOKIE_SECRET_FILE`: Secret used to sign and verify `copper_session` HttpOnly cookies.
- `NCE_API_KEY_FILE`: Server-to-server HMAC secret key for NCE admin REST calls.
- `ENTRA_CLIENT_SECRET_FILE`: Optional Microsoft Entra ID client secret for OIDC auth.
- `NCE_BASE_URL_FILE`: Optional mount for upstream NCE endpoint.

### Resolution & Sanitization Rules
1. **Precedence**: Direct environment variables (`COOKIE_SECRET`, `NCE_API_KEY`) take precedence if provided and non-empty; otherwise, file mounts (`*_FILE`) are resolved.
2. **BOM Stripping**: The reader automatically strips UTF-8 Byte Order Marks (`\uFEFF` / `0xEF 0xBB 0xBF`) to prevent silent token corruption from Windows/PowerShell text editors.
3. **Whitespace Trimming**: Surrounding whitespace, tabs, and newlines (`\r\n`, `\n`) are trimmed.
4. **Fail-Closed Semantics**:
   - If a file path is specified but cannot be read (e.g., missing mount or permission error), boot **throws immediately**.
   - If a secret is empty after BOM and whitespace stripping, boot **throws immediately**.
   - If a required secret is missing from both direct environment variables and file mounts, boot **throws immediately**.
5. **No Fallback Defaults (Re-asserting CL2 B121)**:
   - Hardcoded default secrets (such as `'fallback-secret-for-dev'`) are forbidden. Boot fails closed if secrets are absent, regardless of environment.

---

## 4. Verification & Testing

The secret reader behavior is verified by unit tests in `bff/src/config.test.ts`:
- BOM-prefixed secret files produce identical values to clean secret files.
- Non-existent or unreadable secret files throw on boot.
- Empty or whitespace-only secret files throw on boot.
- Missing required secrets throw with descriptive error messages.
