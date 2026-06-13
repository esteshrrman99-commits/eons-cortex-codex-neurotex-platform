-- EONS RLS Policy Draft
-- Status: draft only. Tighten claims/roles before production.

-- Example owner/admin read policy placeholder.
create policy if not exists matter_files_owner_admin_read on public.matter_files for select using (auth.role() = 'authenticated');
create policy if not exists evidence_records_owner_admin_read on public.evidence_records for select using (auth.role() = 'authenticated');
create policy if not exists upload_metadata_owner_admin_read on public.upload_metadata for select using (auth.role() = 'authenticated');
create policy if not exists reviewer_notes_owner_admin_read on public.reviewer_notes for select using (auth.role() = 'authenticated');
create policy if not exists audit_events_owner_admin_read on public.audit_events for select using (auth.role() = 'authenticated');

-- Insert/update/delete policies must be narrowed to owner/admin/reviewer claims before production.
-- Do not rely on these draft policies for sensitive production records.
