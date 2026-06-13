# EONS Supabase Project Setup Guide

Purpose: create the real Supabase backend foundation without putting secrets in Git.

Step 1: Create Supabase project
- Go to Supabase dashboard.
- Create a new project.
- Save the project URL privately.
- Do not paste service keys into chat.

Step 2: Run SQL schema draft
- Open SQL Editor.
- Review supabase/sql/001_eons_schema_draft.sql.
- Run only after reviewing table names and fields.
- Confirm tables exist: matter_files, evidence_records, upload_metadata, audit_events, reviewer_notes.

Step 3: Review RLS draft
- Open supabase/policies/001_rls_policy_draft.sql.
- Treat current policies as starter placeholders only.
- Tighten policies before sensitive production data.
- Confirm RLS is enabled on all sensitive tables.

Step 4: Create private storage bucket
- Bucket name: eons-evidence-vault.
- Public access: off.
- Public URLs: disabled for sensitive evidence.
- Upload path should include owner, matter, record, and timestamp structure.

Step 5: Runtime secrets only
- SUPABASE_URL goes in backend runtime environment.
- SUPABASE_SERVICE_ROLE_KEY goes in backend runtime environment only.
- Never place service role key in GitHub Pages JavaScript.
- Never place service role key in Git, docs, reports, screenshots, or chat.

Step 6: Private pilot only
- Test with fake records first.
- Verify audit events.
- Verify blocked routes.
- Verify CORS.
- Verify backup plan.
- Verify reviewer workflow.

Production remains blocked until security and professional review are complete.
