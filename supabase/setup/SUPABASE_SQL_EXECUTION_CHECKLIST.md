# EONS Supabase SQL Execution Checklist

[ ] Create Supabase project
[ ] Open SQL Editor
[ ] Review schema draft
[ ] Run supabase/sql/001_eons_schema_draft.sql
[ ] Confirm matter_files table exists
[ ] Confirm evidence_records table exists
[ ] Confirm upload_metadata table exists
[ ] Confirm audit_events table exists
[ ] Confirm reviewer_notes table exists
[ ] Confirm RLS enabled on all tables
[ ] Review RLS policy draft
[ ] Do not use draft RLS for sensitive records until tightened
[ ] Create private storage bucket eons-evidence-vault
[ ] Confirm bucket is private
[ ] Confirm no public URLs for sensitive files
[ ] Add backend runtime secrets only after private backend is selected
[ ] Test with fake records only
[ ] Complete security review before sensitive production upload
