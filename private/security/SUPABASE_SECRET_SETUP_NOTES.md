# Supabase Secret Setup Notes

Never commit these:
- SUPABASE_SERVICE_ROLE_KEY
- database password
- JWT secret
- storage signing secrets
- backup credentials

Allowed only in backend runtime secrets:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- EONS_CORS_ORIGIN
- EONS_OWNER_APPROVAL
- EONS_UPLOADS_ENABLED

Browser-visible keys:
- Only use anon/public key if RLS is correctly configured and reviewed.
- Never use service role key in GitHub Pages JavaScript.
