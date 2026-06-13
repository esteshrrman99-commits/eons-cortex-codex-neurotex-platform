# Provider Selection Matrix

## Option A: GitHub-only
Use for:
- public static pages
- docs
- proof reports
- owner dashboards without sensitive storage

Do not use for:
- encrypted sensitive upload vault
- private database
- production backend secrets

## Option B: Cloudflare Workers + R2
Use for:
- serverless backend candidate
- encrypted object storage candidate
- API endpoints candidate

Review needed:
- auth integration
- database pairing
- secrets
- access control
- storage encryption
- backups

## Option C: Supabase
Use for:
- Postgres database candidate
- auth candidate
- storage candidate
- quick backend app prototype

Review needed:
- storage limits
- row-level security
- private buckets
- backups
- access logs
- compliance fit

## Option D: Local-only until ready
Use for:
- safest current mode
- no sensitive upload
- mock packets
- owner review

Decision now:
Continue GitHub Pages + local mock backend while selecting free infrastructure.
