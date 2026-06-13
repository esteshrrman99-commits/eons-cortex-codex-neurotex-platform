# EONS Supabase File Registry

SQL:
- supabase/sql/001_eons_schema_draft.sql
- supabase/policies/001_rls_policy_draft.sql
- supabase/policies/PRIVATE_BUCKET_POLICY_NOTES.md

Setup:
- supabase/setup/SUPABASE_PROJECT_SETUP_GUIDE.md
- supabase/setup/SUPABASE_SQL_EXECUTION_CHECKLIST.md

Adapters:
- backend/vault-api/src/adapters/supabase-adapter.js
- backend/vault-api/docs/SUPABASE_ADAPTER_PLACEHOLDER.md
- supabase/adapters/SUPABASE_ADAPTER_RUNTIME_SETUP.md

Pilot:
- supabase/pilot/PRIVATE_PILOT_TEST_PLAN.md
- supabase/test-data/001_fake_pilot_seed.sql
- supabase/test-data/FAKE_RECORD_EXAMPLES.md

Deployment:
- supabase/deployment/PRIVATE_BACKEND_DEPLOYMENT_CHECKLIST.md
- supabase/deployment/BACKEND_DEPLOYMENT_PATH_SELECTION.md
- supabase/deployment/EDGE_FUNCTION_DEPLOYMENT_GUIDE.md

Functions:
- supabase/functions/health/index.ts
- supabase/functions/production-readiness/index.ts
- supabase/functions/sensitive-upload/index.ts
- supabase/functions/_shared/eons-gate-helpers.ts

Security:
- private/security/SUPABASE_SECRET_SETUP_NOTES.md
- private/security/SUPABASE_SERVICE_ROLE_BOUNDARY.md
- private/security/RUNTIME_SECRET_BOUNDARY.md
- private/security/EDGE_FUNCTION_DEPLOYMENT_SECRET_RULES.md
- private/security/SUPABASE_PROMPT_11_FUNCTION_BOUNDARY.md
