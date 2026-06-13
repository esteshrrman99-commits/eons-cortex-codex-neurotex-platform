# EONS Supabase Edge Function Scaffold Notes

Purpose: prepare the future Supabase Edge Function route map without committing secrets or enabling sensitive upload.

Function candidates:
- health: return backend health
- production-readiness: return gate status
- supabase-config-safe: return safe configured/missing status only, never secret values
- evidence-create: create fake/pilot evidence record only after auth/RLS review
- upload-metadata-create: create metadata record only
- audit-event-create: append audit event
- reviewer-status-update: update review status
- sensitive-upload: blocked until full production gate passes

Security boundary:
- No service role key in Git.
- No service role key in GitHub Pages JavaScript.
- No sensitive files in public/docs/reports.
- Functions must require auth before real records.
- Functions must write audit events.
- Sensitive upload route must return blocked until every gate passes.
