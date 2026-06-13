# Deployment Path Security Boundary

GitHub Pages:
- static control UI only
- no secrets
- no sensitive production file storage

Supabase backend:
- auth required
- RLS required
- private bucket required
- service role key runtime-only
- audit logging required
- CORS locked to Pages origin

Production remains blocked until:
- real project configured
- runtime secrets configured outside Git
- backend functions deployed
- fake-record private pilot passes
- security/professional review complete
