# EONS Free-First Infrastructure Decision

Decision:
GitHub Pages remains the permanent free public stage.

Reason:
It is already working, committed, pushed, and suitable for static public UI, documentation, proof pages, route maps, and family preview pages.

Boundary:
GitHub Pages is not the encrypted backend vault. Do not use it for sensitive production file storage.

Free-first candidate stack:
- Static public staging: GitHub Pages
- Backend host candidate: Cloudflare Workers free tier, or equivalent free serverless host
- Database candidate: Supabase Free Postgres, Neon Free Postgres, or equivalent
- File storage candidate: Cloudflare R2 free tier, Supabase Storage free tier, or equivalent
- Secrets: GitHub Secrets for CI/CD only; provider secrets for runtime
- Auth candidate: Supabase Auth / Clerk / Auth0 starter
- OCR/parser: local/open-source parser first; paid OCR later if needed
- Backup: encrypted object storage with versioning later

Production rule:
No sensitive production upload until authentication, encryption, storage, database, backups, audit logging, and security/professional review are complete.
