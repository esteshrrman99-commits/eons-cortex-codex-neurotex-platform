# Free / Low-Cost Provider Notes

Supabase Edge Functions:
- Best first fit because the project already selected Supabase Auth/Postgres/Storage.
- Free quota may be enough for early private pilot, but verify current quota before production.

Render:
- Good fallback for a persistent Node backend.
- Free web services may be available, but database/free-plan limits must be verified before relying on production.

Cloudflare Workers + R2:
- Strong later add-on for edge API and object storage.
- Needs auth/database pairing unless using Supabase for those parts.

Railway:
- Developer-friendly.
- Review current subscription/usage costs before selecting.

Fly.io:
- Powerful for Docker/global apps.
- Treat as cost-managed deployment, not guaranteed permanently free.

Decision:
Use Supabase-first for the private pilot. Keep GitHub Pages as static front-end.
