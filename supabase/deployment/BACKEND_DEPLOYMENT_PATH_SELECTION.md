# EONS Backend Deployment Path Selection

Decision: Supabase Edge Functions first, with GitHub Pages as the permanent static front-end.

Why this path:
- Supabase already fits the selected stack: Auth, Postgres, Storage, and Edge Functions.
- Keeps backend functions close to Supabase Auth/database/storage.
- Reduces provider sprawl for the first private pilot.
- Keeps secrets outside GitHub Pages.
- Maintains sensitive upload blocked until real runtime gates pass.

Option ranking:
1. Supabase Edge Functions - first candidate for private pilot functions.
2. Render web service - good Node backend fallback, but confirm free-tier limits before relying on it.
3. Cloudflare Workers + R2 - strong later edge/object-storage path, may require adapter conversion and database/auth pairing.
4. Railway - simple deploy path, but subscription/usage model should be reviewed before choosing.
5. Fly.io - powerful deployment path, but treat as pay-as-you-go/cost-managed, not guaranteed free.

Selected now:
- Front-end: GitHub Pages
- Backend pilot candidate: Supabase Edge Functions or Supabase-hosted function layer
- Database: Supabase Postgres
- Storage: Supabase private Storage bucket
- Auth: Supabase Auth
- Secrets: Supabase dashboard/runtime secrets only

Still blocked:
- real sensitive upload
- production upload enabled
- service role key in any browser/public file
- final reviewer approval
- production mode
