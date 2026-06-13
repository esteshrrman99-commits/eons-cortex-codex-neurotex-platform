# EONS Supabase Edge Function Deployment Guide

Purpose: prepare manual/CLI deployment of Supabase Edge Functions without committing secrets.

Important boundary:
- This guide does not deploy functions automatically.
- Do not paste service role keys into terminal history unless you are using the official Supabase secret-setting flow.
- Do not commit Supabase project refs, access tokens, service role keys, or .env files.
- Sensitive upload remains blocked until every production gate passes.

Manual dashboard setup:
1. Open Supabase dashboard.
2. Select the EONS project.
3. Confirm Auth, Database, and Storage are configured.
4. Confirm private bucket eons-evidence-vault exists.
5. Confirm RLS is enabled on sensitive tables.
6. Add function secrets only inside Supabase dashboard/secrets area.
7. Deploy functions only after fake-record pilot review.

CLI setup, placeholders only:
1. Install Supabase CLI locally or use Codespaces if authenticated.
2. Run supabase login only in your own terminal.
3. Link the project using your project ref privately.
4. Do not commit .supabase, tokens, or linked project secrets if generated.
5. Deploy only placeholder/safe functions first.

Function deployment order:
1. health
2. production-readiness
3. supabase-config-safe
4. audit-event-create placeholder
5. evidence-create fake-only
6. upload-metadata-create fake-only
7. reviewer-status-update placeholder
8. sensitive-upload blocked route

Testing:
- GET health returns safe OK.
- production-readiness returns blocked until gates pass.
- supabase-config-safe returns present/missing only, never secret values.
- sensitive-upload returns blocked.
- fake records only.
