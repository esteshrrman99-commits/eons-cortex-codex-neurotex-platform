# Supabase Setup Checklist

1. Create Supabase project.
2. Create private storage bucket: eons-evidence-vault.
3. Create database tables:
   - matter_files
   - evidence_records
   - upload_metadata
   - audit_events
   - reviewer_notes
4. Enable RLS on all sensitive tables.
5. Create role model:
   - owner
   - admin
   - reviewer
   - viewer
6. Configure CORS / allowed origin for GitHub Pages frontend.
7. Store secrets only in backend runtime environment.
8. Never expose service role key in browser JavaScript.
9. Add audit event inserts for sensitive actions.
10. Add backup/export plan.
11. Test with fake records only.
12. Complete security/professional review before sensitive production upload.
