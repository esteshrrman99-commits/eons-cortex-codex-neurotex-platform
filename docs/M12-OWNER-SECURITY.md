# EONS M12 — Private Owner Security Audit

This release adds a **read-only security audit**, not a public owner login.

Run on the existing DigitalOcean host as root:

```bash
bash scripts/m12-owner-security-audit.sh
```

The audit checks that M9 and M11 are active as the restricted `eonsm9` user, their sockets are loopback-only, the owner secret file is restricted, health endpoints work, and unauthenticated owner/session requests return 401. It prints no secrets.

**Not certified:** Password-based login, browser sessions, persistent revocation, MFA, customer accounts, role-based authorization, public reverse proxy, and secure financial-data ingestion. Keep all customer data disabled. Existing M8 remains a sample-only browser demonstration.

## Private owner access

Use the Termux SSH connection for server administration. Do not expose ports 18791 or 18792 publicly or paste the owner token into the public M8 website.

## Rollback

This milestone makes no service or configuration changes, so rollback is not necessary.
