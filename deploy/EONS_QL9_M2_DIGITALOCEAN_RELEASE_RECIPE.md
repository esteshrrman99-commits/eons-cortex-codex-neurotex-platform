# EONS-QL×9-M2 — DigitalOcean release recipe (approval required)

Project: EONS Compliance Engineering Platform Starter
Source: esteshrrman99-commits/eons-cortex-codex-neurotex-platform
Target: existing DigitalOcean droplet eons-hub-01 (604423155)
Release type: public static frontend only, from docs/
Owner authorization: requested, not yet granted by BLACKSTAR server-side allowlist.
Production writes: MUST remain disabled until authorized by server-side policy.

## Scope
- Deploy only the already-existing static site in docs/ to a separate EONS virtual host.
- Do not change BLACKSTAR, Stripe, DNS, firewall, NGINX default site, or other services.
- Do not expose private/, backend/vault-api/data/, secrets, or tax/customer records.
- Do not enable customer uploads, tax filing, refunds, payments, or production authentication.
- No new infrastructure resources or billable GitHub workflows without explicit owner approval.

## Preflight (read-only)
1. Verify repo commit and docs/index.html, docs/assets, docs/pages.
2. Run npm run build and npm run verify in an isolated build environment.
3. Inspect existing NGINX virtual hosts, TLS certs, ports, disk space, and backups.
4. Confirm a unique approved EONS hostname; do not invent DNS.
5. Confirm release directory, web root ownership, and rollback target.
6. Verify BLACKSTAR agent cloud adapter, project allowlist, and production write approval.

## Release (only after all gates pass)
1. Stage the verified docs/ output under a versioned EONS-only release path.
2. Serve static files using an EONS-only NGINX virtual host and approved hostname.
3. Configure TLS using an existing approved certificate or supported ACME issuance.
4. Switch only the EONS virtual host to the new release atomically.
5. Verify GET / returns 200, assets load, HTTPS valid, and unrelated routes unaffected.
6. Record deployed commit, timestamps, HTTP evidence, and rollback command in the release ledger.

## Rollback
Restore previous EONS-only virtual-host root/symlink and reload NGINX after config test.
Never touch unrelated virtual hosts or systemd services.

## Production readiness
This repository's README explicitly describes an evidence organizer starter. A live static site is not proof of secure user login, production tax processing, compliant tax filing, or Stripe payments. Those features require independent implementation, verification, and authorization.

## Known blockers as of 2026-10-29
BLACKSTAR deployment_plan returned PROJECT_NOT_ALLOWLISTED / SERVER_PROJECT_RECIPE_REQUIRED.
BLACKSTAR fabric_status returned production_write_access=false.
BLACKSTAR agent_device_status returned cloud_worker=ADAPTER_NOT_VERIFIED.
This document proposes a recipe; committing it does not register it server-side or deploy the site.
