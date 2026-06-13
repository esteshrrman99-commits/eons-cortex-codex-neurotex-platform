# Smoke-Test Secret Response Plan

If a secret is found:
1. Stop committing.
2. Remove the secret from the file.
3. Add the file pattern to .gitignore.
4. Rotate the exposed secret in the provider dashboard.
5. Commit only the cleanup, never the secret.
6. Re-run scripts/eons-secret-smoke-scan.js.
