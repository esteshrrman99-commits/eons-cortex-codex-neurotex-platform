# EONS Edge Function Route Map

GET /functions/v1/health
GET /functions/v1/production-readiness
GET /functions/v1/supabase-config-safe
POST /functions/v1/evidence-create
POST /functions/v1/upload-metadata-create
POST /functions/v1/audit-event-create
POST /functions/v1/reviewer-status-update
POST /functions/v1/sensitive-upload

Default route behavior:
- health: safe
- production-readiness: safe gate status
- supabase-config-safe: safe missing/present only, no secret values
- evidence-create: fake/pilot only until auth/RLS/security review
- upload-metadata-create: fake/pilot only until storage/security review
- audit-event-create: append-only later
- reviewer-status-update: reviewer workflow later
- sensitive-upload: blocked by default
