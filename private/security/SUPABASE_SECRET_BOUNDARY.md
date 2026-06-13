# Supabase Secret Boundary

Never expose:
- SUPABASE_SERVICE_ROLE_KEY
- database password
- storage signing secrets
- encryption keys
- backup credentials

Allowed in browser only if intentionally public:
- Supabase URL
- anon/public key for client-safe auth flows, only after RLS is correctly configured

Current status:
No production secrets should be added yet.
