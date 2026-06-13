# EONS Supabase Deployment Smoke-Test Checklist

Purpose: verify the repo and deployment are safe before adding any runtime secrets.

Smoke-test rules:
- Do not paste real secrets into terminal.
- Do not commit .env files.
- Do not upload real sensitive records.
- Confirm sensitive upload remains blocked until runtime gates pass.

Checks:
[ ] git status is clean except expected reports
[ ] .gitignore blocks .env files
[ ] no SUPABASE_SERVICE_ROLE_KEY value appears in Git
[ ] no database password appears in Git
[ ] no production evidence files appear in Git
[ ] no private uploads appear in Git
[ ] GitHub Pages still builds
[ ] docs/pages exist
[ ] /production-readiness exists in backend scaffold
[ ] /supabase-config exists in backend scaffold
[ ] /sensitive-upload remains blocked without runtime gates
[ ] /supabase-action-mock returns placeholder-only result
[ ] provider runtime secrets are not configured until selected
[ ] private pilot uses fake records only
[ ] reviewer status remains review_required

Pass condition:
The platform can be staged safely with no secrets in Git and no sensitive upload enabled.

Fail condition:
Any secret, private file, production evidence, or real sensitive data appears in Git, public, docs, reports, screenshots, or chat.
