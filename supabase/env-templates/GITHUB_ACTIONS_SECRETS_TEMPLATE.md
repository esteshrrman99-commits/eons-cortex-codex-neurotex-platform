# EONS GitHub Actions secret names - no real values

Required later for deployment automation only:
- EONS_BACKEND_DEPLOY_TOKEN
- EONS_BACKEND_DEPLOY_URL
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY

Rules:
- Store real values in GitHub Actions secrets or backend provider runtime secrets only.
- Never write real values into this file.
- Never expose service role keys to GitHub Pages JavaScript.
