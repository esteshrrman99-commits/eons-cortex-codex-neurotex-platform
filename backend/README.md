# M9 private API foundation

This is a **restricted foundation**, not a production financial-data service.

- FastAPI listens on `127.0.0.1:18791` only.
- `/health` is local-only, contains no private data.
- `/owner/status` requires a random 32+ character bearer token.
- Only minimal audit event labels and outcomes are stored in SQLite.
- No uploads, taxpayer information, bank credentials, external endpoints, or public NGINX routing.
- Do not expose port 18791 or proxy this API publicly.
- Do not paste owner tokens into chat or terminal output.

## Owner deployment

Use `scripts/deploy-m9-private.sh` on the existing DigitalOcean host as root.
The script backs up any previous M9 deployment and uses an isolated virtual environment.
