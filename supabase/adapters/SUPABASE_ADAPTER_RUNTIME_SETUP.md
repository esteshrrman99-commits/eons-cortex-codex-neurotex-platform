# Supabase Adapter Runtime Setup

Do not put secrets in Git.

Later runtime secrets only:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- EONS_CORS_ORIGIN

Required before real writes: RLS, private bucket, auth, CORS, audit logging, backup, reviewer gate, security review.
