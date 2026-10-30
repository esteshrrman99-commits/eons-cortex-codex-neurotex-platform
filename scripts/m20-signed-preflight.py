#!/usr/bin/env python3
"""M20.11C read-only signed release preflight. NOT a deployment authorization by itself.

Usage: python3 scripts/m20-signed-preflight.py STAGE COMMIT TRUSTED_PUBLIC_KEY
Stage must contain deploy/release.manifest, deploy/release.sig,
deploy/m20-additive-manifest.sha256 and listed docs files.
Private signing keys must never reside on the deployment host.
"""
import hashlib
import os
from pathlib import Path, PurePosixPath
import re
import subprocess
import sys

def deny(message):
    raise SystemExit("DENIED: " + message)

def main():
    if len(sys.argv) != 4:
        deny("usage: STAGE EXACT_COMMIT TRUSTED_PUBLIC_KEY")
    stage = Path(sys.argv[1]).resolve(strict=True)
    commit = sys.argv[2]
    pubkey = Path(sys.argv[3])
    if not re.fullmatch(r"[0-9a-f]{40}", commit):
        deny("invalid commit")
    if pubkey.is_symlink() or not pubkey.is_file():
        deny("trusted public key unavailable")
    deploy = stage / "deploy"
    signed = deploy / "release.manifest"
    sig = deploy / "release.sig"
    checksums = deploy / "m20-additive-manifest.sha256"
    for p in (deploy, signed, sig, checksums):
        if p.is_symlink() or not p.resolve().is_relative_to(stage):
            deny("symlink or escaped release path")
    if not signed.is_file() or not sig.is_file() or not checksums.is_file():
        deny("missing signed release artifacts")
    verified = subprocess.run(
        ["openssl", "pkeyutl", "-verify", "-pubin", "-inkey", str(pubkey),
         "-rawin", "-in", str(signed), "-sigfile", str(sig)],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=False,
    )
    if verified.returncode != 0:
        deny("invalid release signature")
    expected_text = (
        "EONS_RELEASE_FORMAT=1\n"
        f"COMMIT={commit}\n"
        f"CHECKSUM_MANIFEST_SHA256={hashlib.sha256(checksums.read_bytes()).hexdigest()}\n"
    )
    if signed.read_bytes() != expected_text.encode("ascii"):
        deny("signed release binding mismatch")
    lines = checksums.read_text("ascii").splitlines()
    if not 1 <= len(lines) <= 20:
        deny("invalid manifest size")
    seen = set()
    for line in lines:
        m = re.fullmatch(r"([0-9a-f]{64})  (docs/(?:assets|pages)/[A-Za-z0-9._/-]+)", line)
        if not m:
            deny("invalid checksum entry")
        name = m.group(2)
        parts = PurePosixPath(name).parts
        if any(part in (".", "..") for part in name.split("/")) or name in seen:
            deny("unsafe or duplicate path")
        if PurePosixPath(name).suffix not in (".html", ".js", ".css", ".webp", ".png", ".svg"):
            deny("unsupported file type")
        seen.add(name)
        path = stage
        for part in parts:
            path = path / part
            if path.is_symlink():
                deny("symlink in release path")
        if not path.is_file() or not path.resolve().is_relative_to(stage):
            deny("missing or escaped file")
        if hashlib.sha256(path.read_bytes()).hexdigest() != m.group(1):
            deny("release file checksum mismatch")
    print("M20_SIGNED_PREFLIGHT=PASS")
    print("DEPLOYMENT_EXECUTED=NO")

if __name__ == "__main__":
    main()
