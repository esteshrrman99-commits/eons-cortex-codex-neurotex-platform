# EONS Supabase Private Backend Deployment Checklist

Purpose: prepare deployment of the private backend without placing secrets in Git, GitHub Pages, screenshots, or chat.

Deployment rule:
- GitHub Pages remains the static front-end.
- Backend must deploy separately.
- Secrets belong only in backend runtime environment.
- Sensitive upload remains blocked until real gate passes.

Backend deployment candidates:
- Render free/low-cost web service
- Fly.io app
- Railway app
- Supabase Edge Functions later
- Cloudflare Workers later if adapter is converted

Required runtime environment variables:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- EONS_CORS_ORIGIN=https://esteshrrman99-commits.github.io
- EONS_PRODUCTION_MODE=true only after review
- EONS_AUTH_ENABLED=true only after auth works
- EONS_ENCRYPTION_ENABLED=true only after encryption works
- EONS_UPLOADS_ENABLED=true only after all gates pass
- EONS_REVIEW_ENABLED=true only after reviewer workflow works
- EONS_OWNER_APPROVAL=true only after owner signs off

Deploy checklist:
[ ] Choose backend host
[ ] Create backend app/service
[ ] Add runtime secrets in provider dashboard only
[ ] Confirm .env is not committed
[ ] Confirm service role key is not in GitHub Pages JavaScript
[ ] Configure CORS to approved GitHub Pages origin only
[ ] Start backend service
[ ] Test /health
[ ] Test /gate
[ ] Test /production-readiness
[ ] Test /supabase-config
[ ] Confirm sensitive upload remains blocked
[ ] Test fake records only
[ ] Confirm audit event placeholder works
[ ] Confirm reviewer gate remains review_required
[ ] Complete security review before real sensitive upload
