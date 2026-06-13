# Runtime Secret Boundary

Never commit:
- .env
- service role keys
- database passwords
- JWT secrets
- storage secrets
- backup secrets

Allowed locations:
- backend host runtime environment variables
- provider secret manager
- GitHub Actions secrets only for deployment automation

Never allowed locations:
- public/
- docs/
- GitHub Pages JavaScript
- reports/
- screenshots
- ChatGPT messages
- README examples with real values
