# EONS Supabase Private Pilot Test Plan

Purpose: verify the future Supabase-backed vault using fake records only.

Pilot rule:
- Do not upload real sensitive documents.
- Do not enter real SSNs, bank records, tax transcripts, IDs, medical records, or legal evidence.
- Use fake/demo records only until security and professional review are complete.

Pilot test sequence:
1. Create fake matter file.
2. Create fake evidence record.
3. Create fake upload metadata record.
4. Create fake audit event.
5. Create fake reviewer note.
6. Confirm RLS blocks unauthorized access.
7. Confirm private bucket is not public.
8. Confirm service role key is not in browser code.
9. Confirm backend CORS is restricted.
10. Confirm backup/export process is documented.
11. Confirm reviewer status stays review_required.
12. Confirm sensitive upload remains blocked until owner approval.

Pass condition:
- Fake records can be created only through approved backend flow.
- Unauthorized access is blocked.
- Audit events are recorded.
- No real sensitive data is used.

Fail condition:
- Any sensitive data is used.
- Any key appears in Git, public, docs, reports, screenshots, or chat.
- Public bucket access is enabled.
- RLS is disabled.
- Upload bypasses backend gate.
