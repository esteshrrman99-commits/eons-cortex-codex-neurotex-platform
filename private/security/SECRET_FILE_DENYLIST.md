# EONS Secret File Denylist

These must stay out of Git:
- .env
- .env.local
- .env.production
- *.pem
- *.key
- *service-role*
- *secret*
- local-vault-exports/
- private-uploads/
- sensitive-uploads/
- production-evidence/
- vault-backups/
- *.sqlite
- *.db

If a secret is accidentally created, remove it before commit and rotate the key if exposed.
