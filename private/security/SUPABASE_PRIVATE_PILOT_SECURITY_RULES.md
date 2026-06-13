# Supabase Private Pilot Security Rules

Required:
- Fake records only
- RLS enabled
- private bucket only
- no public URLs for sensitive-style files
- backend-only upload route
- audit event for every fake upload/read/export/review action
- reviewer status defaults to review_required
- owner approval remains false until final private pilot review

Blocked:
- real sensitive data
- public bucket
- service role key in browser
- service role key in Git
- production upload before security review
