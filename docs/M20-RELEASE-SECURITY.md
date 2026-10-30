# EONS M20.12 — Detached signed release protocol (DRAFT)

**Status:** development only; do not activate on the production server.
No production deploy, billing, filing, taxpayer ingestion, or background write service is authorized.

## Why detached signatures are required

A Git commit cannot contain an Ed25519 attestation that signs the exact SHA of
that same commit: adding the signature changes the commit SHA. The previous
in-archive signed record passed an isolated synthetic test but cannot be built
as a normal immutable Git release. M20.12 moves the attestation OUTSIDE the
Git archive, signed only after the commit SHA exists.

The archive from the exact Git commit must contain:

- deploy/m20-additive-manifest.sha256
- docs/assets/<new flat file> and/or docs/pages/<new flat file>

The manifest is ASCII, 1–20 entries, each of the form:
64 lowercase SHA256 hex characters, two spaces, docs/assets/example.js.

The separately delivered attestation directory must contain:

- release.manifest (ASCII, exactly three lines)
- release.sig (raw Ed25519 signature of release.manifest)

The signed record has exactly these bytes (with final newline):

    EONS_RELEASE_FORMAT=1
    COMMIT=<40 lowercase hex Git commit>
    CHECKSUM_MANIFEST_SHA256=<SHA256 of archived manifest bytes>

The private key MUST stay off the deployment host. The deployment host needs
only a pinned public verification key, provisioned independently of the release
repository and protected from the restricted worker. A signed record is
required even when the Git branch and commit match. A text approval phrase is
NOT authentication.

## Safe offline signing sequence (operator, NOT server)

1. Create the intended commit containing the manifest and assets.
2. Record its immutable 40-character SHA.
3. Hash the exact manifest bytes from that commit.
4. Create release.manifest with the exact three-line format above.
5. Sign the record using the authorized offline Ed25519 private key with
   OpenSSL pkeyutl -sign -rawin.
6. Deliver release.manifest and release.sig separately; never copy the
   private key to DigitalOcean.
7. Keep the deployment service disabled until an authorized production review.

Example read-only verification:

    python3 scripts/m20-signed-preflight.py \
      /path/to/extracted-commit \
      <exact-commit-sha> \
      /path/to/trusted-public.pem \
      /path/to/detached-attestation

The installer additionally requires EONS_ATTESTATION_DIR to point to the
detached record. Its trusted verifier and pinned public key must be deployed
from an independently controlled, read-only location, not executed from the
fetched Git archive. Never run npm build in the production checkout: the build
process replaces docs/ and would destroy the M17 live design.

## Regression tests

    bash -n scripts/m20-controlled-release.sh
    python3 -m unittest discover -s tests -p 'test_m20_detached_preflight.py' -v

These tests use only disposable synthetic assets and temporary Ed25519 keys.

## Release blockers (do not bypass)

- A dedicated non-root worker needs audited write permissions, immutable
  trusted code/key, and no unrestricted sudo.
- The current shell installer has not passed full end-to-end failure/rollback
  tests in an isolated site. A process crash between final hard-link creation
  and rollback journal update can leave a new file behind. A writable
  destination directory can also be subject to races from other processes.
- Production signing-key custody, rotation, and explicit deployment approvals
  have not been established.
- Public HTTP 200 checks are necessary but insufficient for a production
  accessibility, functional, and financial-compliance acceptance audit.
- The existing production M17 docs directory must be preserved.

Do not merge or deploy this draft until these items are resolved.
