# EONS Provider Selection Prompt 2 Decision

Decision:
Use a Supabase-first free/low-cost backend path.

Architecture:
- GitHub Pages: permanent static front-end/control layer
- Supabase Auth: auth candidate
- Supabase Postgres: database candidate
- Supabase Storage private bucket: encrypted/private file storage candidate
- Supabase tables: evidence_records, matter_files, upload_metadata, audit_events, reviewer_notes
- Backend runtime secrets: stored outside Git
- Sensitive upload: blocked until all real gates pass

Why:
Supabase gives the simplest first path for auth + database + storage together. Cloudflare Workers + R2 remains a strong later alternative/add-on but needs database/auth pairing.

Boundary:
Do not put Supabase service role keys in GitHub Pages JavaScript, Git, docs, screenshots, or chat.
