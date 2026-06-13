# Edge Function Deployment Secret Rules

Never commit:
- Supabase access token
- project ref if you consider it private
- service role key
- .supabase local state if it includes private data
- .env files

Allowed:
- placeholder guide text
- route names
- safety checklist
- blocked-route scaffold

Sensitive upload route must stay blocked until auth, RLS, private storage, encryption, audit logging, backup, CORS, reviewer approval, and owner approval are complete.
