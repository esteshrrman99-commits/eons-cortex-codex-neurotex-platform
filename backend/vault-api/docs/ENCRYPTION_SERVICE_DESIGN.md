# EONS Encryption Service Design

Status: scaffold only / disabled by default.

Current behavior:
- EONS_ENCRYPTION_ENABLED=false
- No real file encryption is active
- No sensitive production upload is allowed
- Service can produce mock SHA-256 fingerprints for design/testing only

Future production requirements:
- managed secrets/key vault
- per-file encryption
- key rotation
- envelope encryption
- encrypted metadata fields
- access control by owner/reviewer role
- audit log for every decrypt/read/export
- backup and recovery process
- security review before use

Boundary:
This is not production encryption yet.
