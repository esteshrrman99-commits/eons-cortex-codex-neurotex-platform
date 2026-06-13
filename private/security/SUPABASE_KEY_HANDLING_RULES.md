# EONS Supabase Key Handling Rules

Never commit or expose:
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

Browser rule:
GitHub Pages must never contain service role keys or private database credentials.
