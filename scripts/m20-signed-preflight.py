#!/usr/bin/env python3
"""Verify an EONS additive release using a DETACHED signed attestation.

Usage: m20-signed-preflight.py STAGE COMMIT TRUSTED_PUBLIC_KEY ATTESTATION_DIR

The release archive contains the checksum manifest and assets, NOT its own
commit-bound signature. A release signer signs the exact Git commit *after*
the commit exists; the signed record and signature are supplied separately.
Never place the private signing key on the deployment server.
"""
import hashlib
from pathlib import Path
import re
import subprocess
import sys

MAX_ASSET_BYTES = 20 * 1024 * 1024


def deny(message):
    raise SystemExit("DENIED: " + message)


def regular_file_no_symlinks(path, root):
    """Reject symlinks in every component from root through path."""
    if root.is_symlink() or not root.is_dir():
        deny("unsafe root directory")
    try:
        rel = path.relative_to(root)
    except ValueError:
        deny("path outside trusted root")
    cur = root
    for part in rel.parts:
        if part in (".", ".."):
            deny("unsafe path component")
        cur = cur / part
        if cur.is_symlink():
            deny("symlink in release path")
    if not cur.is_file():
        deny("missing release file")
    return cur


def main():
    if len(sys.argv) != 5:
        deny("usage: STAGE EXACT_COMMIT TRUSTED_PUBLIC_KEY ATTESTATION_DIR")
    stage = Path(sys.argv[1]).absolute()
    commit = sys.argv[2]
    pubkey = Path(sys.argv[3]).absolute()
    att_dir = Path(sys.argv[4]).absolute()
    if not re.fullmatch(r"[0-9a-f]{40}", commit):
        deny("invalid commit")
    if not stage.is_dir() or stage.is_symlink():
        deny("invalid staging directory")
    if pubkey.is_symlink() or not pubkey.is_file():
        deny("trusted public key unavailable")
    if not att_dir.is_dir() or att_dir.is_symlink():
        deny("detached attestation directory unavailable")

    signed = regular_file_no_symlinks(att_dir / "release.manifest", att_dir)
    sig = regular_file_no_symlinks(att_dir / "release.sig", att_dir)
    checksums = regular_file_no_symlinks(
        stage / "deploy" / "m20-additive-manifest.sha256", stage
    )
    if signed.stat().st_size > 1024 or sig.stat().st_size > 1024:
        deny("oversized attestation")
    if checksums.stat().st_size > 8192:
        deny("oversized checksum manifest")
    verified = subprocess.run(
        ["openssl", "pkeyutl", "-verify", "-pubin", "-inkey", str(pubkey),
         "-rawin", "-in", str(signed), "-sigfile", str(sig)],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=False,
    )
    if verified.returncode != 0:
        deny("invalid release signature")
    expected = (
        "EONS_RELEASE_FORMAT=1\n"
        f"COMMIT={commit}\n"
        f"CHECKSUM_MANIFEST_SHA256={hashlib.sha256(checksums.read_bytes()).hexdigest()}\n"
    )
    if signed.read_bytes() != expected.encode("ascii"):
        deny("signed release binding mismatch")
    try:
        lines = checksums.read_text("ascii").splitlines()
    except (UnicodeError, OSError):
        deny("invalid checksum manifest encoding")
    if not 1 <= len(lines) <= 20:
        deny("invalid manifest size")
    seen = set()
    for line in lines:
        # Flat assets/pages paths are intentional: no new directories in production.
        m = re.fullmatch(
            r"([0-9a-f]{64})  (docs/(?:assets|pages)/[A-Za-z0-9][A-Za-z0-9._-]*)",
            line,
        )
        if not m:
            deny("invalid checksum entry")
        name = m.group(2)
        if name in seen:
            deny("duplicate release path")
        if Path(name).suffix not in (".html", ".js", ".css", ".webp", ".png", ".svg"):
            deny("unsupported file type")
        seen.add(name)
        asset = regular_file_no_symlinks(stage / name, stage)
        if asset.stat().st_size > MAX_ASSET_BYTES:
            deny("oversized asset")
        h = hashlib.sha256()
        with asset.open("rb") as f:
            for chunk in iter(lambda: f.read(1024 * 1024), b""):
                h.update(chunk)
        if h.hexdigest() != m.group(1):
            deny("release file checksum mismatch")
    print("M20_DETACHED_SIGNED_PREFLIGHT=PASS")
    print("DEPLOYMENT_EXECUTED=NO")


if __name__ == "__main__":
    main()
