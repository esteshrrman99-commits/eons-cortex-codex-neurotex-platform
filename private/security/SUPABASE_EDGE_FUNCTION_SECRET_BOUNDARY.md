# Supabase Edge Function Secret Boundary

Never commit:
- service role key
- database password
- JWT secret
- storage signing key
- backup key

Edge Function secrets must be set in Supabase project secret/runtime settings only.

Pages may call functions, but Pages must never contain private keys.
