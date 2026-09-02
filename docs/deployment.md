# Deployment & Secret Architecture (Contract-D)

This document describes the deployment architecture, secret management strategy, container healthcheck contracts, and CI/CD pipelines for Copper (`copper-bff` and `copper-web`) per **Contract-D**, Batch 153 (DX.W4), and Batch 154 (DX.W5).

---

## 1. Architectural Overview

Copper is deployed as a dual-container workload alongside the NCE stack:
- **`copper-bff`**: Node.js Backend-for-Frontend (Hono) serving `/api/*`, managing session cookies, HMAC authentication to NCE admin REST (`http://nce-admin:8003`), and tenancy isolation.
- **`copper-web`**: Static web client served behind Caddy.
- **Single Origin**: Caddy routes `/` to `copper-web`, `/api/*` to `copper-bff`, and `/admin*` to `nce-admin` so the browser operates against a single origin without CORS overhead.

---

## 2. CI/CD Image Pipeline (Batch 154 / DX.W5)

Container images for `copper-bff` and `copper-web` are built and published via `.github/workflows/ci.yml` on the self-hosted runner:
- **Registry**: GitHub Container Registry (`ghcr.io/sindrehaugen/copper-bff`, `ghcr.io/sindrehaugen/copper-web`) beside `ghcr.io/sindrehaugen/nce-*`.
- **Tagging Discipline**: Every build carries the exact commit SHA tag (`:${{ github.sha }}`) and updates `:latest` on main branch pushes. A locally-built `latest` never reaches a shared environment without an associated SHA tag.
- **Multi-Stage Separation**: Development dependencies and source trees are stripped in builder stages; runtime images run as non-privileged users (`node` / `appuser`).

> ⚠️ **GitHub Actions Runner & Billing Caveat**:
> GitHub Actions billing has blocked workflow runs twice in this estate. A 2-second all-jobs failure is a runner/account billing limitation, never a defect in the code diff.

---

## 3. Container Healthchecks & Authenticated Readiness Probes

### Why `/healthz` Was Retired
A naive process-level `/healthz` endpoint returning `{"status":"ok"}` proves only that a TCP socket answered. It provides zero assurance that credentials can decrypt or that upstream services are reachable.

*Historical Evidence (2026-09-02)*: `nce-a2a` could not decrypt its active signing key for **26 hours / 10,438 log lines** while `docker ps` continuously printed `healthy`. The application was failing closed honestly, but the healthcheck probe was deaf to the failure.

### Authenticated Topology Probe (`Dockerfile.bff`)
`copper-bff`'s `HEALTHCHECK` performs its own readiness probe against a route it actually requires to operate:
- **Endpoint**: `GET /api/design/topology?namespace_id=default`
- **Authentication**: Dynamically signs a valid `copper_session` cookie using the container's active `COOKIE_SECRET` (or `COOKIE_SECRET_FILE`).
- **Failure Semantics**: If upstream `nce-admin` is stopped, partitioned, unreachable, or returns HTTP 500, the route returns an error status and the probe exits with code 1. The container transitions to `unhealthy` within its configured interval (3 retries × 30s).

---

## 4. Docker Compose Secrets Configuration

Per Contract-D, secrets are passed to containers using Docker Secrets (`*_FILE` mounts) mounted in memory (e.g., `/run/secrets/*`), preventing secrets from leaking into container images or process listings.

> **Note on `docker-compose.yml`**:
> `docker-compose.yml` is owned by the NCE repository. The compose block below defines the contract for running Copper under the `copper` profile:

```yaml
services:
  copper-bff:
    image: ghcr.io/sindrehaugen/copper-bff:${COPPER_IMAGE_TAG:-latest}
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

  copper-web:
    image: ghcr.io/sindrehaugen/copper-web:${COPPER_IMAGE_TAG:-latest}
    container_name: copper-web
    restart: unless-stopped
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

## 5. Fail-Closed Secret Reader (`bff/src/config.ts`)

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

## 6. Verification & Testing

The deployment invariants and secret reader behaviors are verified by automated tests:
- **`bff/src/config.test.ts`**: Verifies BOM stripping, missing secret throw semantics, and fallback absence.
- **`bff/src/routes/design.test.ts`**: Verifies authenticated endpoint behavior and namespace isolation.
- **Container Readiness Demonstration**: Verifies container transitions to `unhealthy` when upstream NCE is stopped.
