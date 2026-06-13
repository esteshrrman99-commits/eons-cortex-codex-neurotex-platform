# Supabase CLI Placeholder Commands

Do not run these with real secrets pasted into chat.

Example flow:
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy health
supabase functions deploy production-readiness
supabase functions deploy supabase-config-safe

Set secrets in Supabase secret manager, not Git:
supabase secrets set SUPABASE_URL=YOUR_VALUE
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_VALUE
supabase secrets set EONS_CORS_ORIGIN=https://esteshrrman99-commits.github.io

Never commit real secret values.
