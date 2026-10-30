#!/usr/bin/env python3
"""Disposable-only regression tests for M20 detached signed release gate."""
import hashlib
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

VERIFIER = Path(__file__).resolve().parents[1] / "scripts" / "m20-signed-preflight.py"
COMMIT = "a" * 40


class SignedReleaseTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(prefix="eons-m20-test-")
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.stage = self.root / "archive"
        self.att = self.root / "detached-attestation"
        (self.stage / "deploy").mkdir(parents=True)
        (self.stage / "docs" / "assets").mkdir(parents=True)
        self.att.mkdir()
        self.asset = self.stage / "docs" / "assets" / "test.js"
        self.asset.write_text("safe synthetic data\n")
        self.manifest = self.stage / "deploy" / "m20-additive-manifest.sha256"
        self.manifest.write_text(
            f"{hashlib.sha256(self.asset.read_bytes()).hexdigest()}  docs/assets/test.js\n"
        )
        self.key = self.root / "private.pem"
        self.pub = self.root / "public.pem"
        subprocess.run(
            ["openssl", "genpkey", "-algorithm", "ED25519", "-out", str(self.key)],
            check=True, capture_output=True,
        )
        subprocess.run(
            ["openssl", "pkey", "-in", str(self.key), "-pubout", "-out", str(self.pub)],
            check=True, capture_output=True,
        )
        self.sign()

    def sign(self):
        (self.att / "release.manifest").write_text(
            "EONS_RELEASE_FORMAT=1\n"
            f"COMMIT={COMMIT}\n"
            f"CHECKSUM_MANIFEST_SHA256={hashlib.sha256(self.manifest.read_bytes()).hexdigest()}\n"
        )
        subprocess.run(
            ["openssl", "pkeyutl", "-sign", "-inkey", str(self.key), "-rawin",
             "-in", str(self.att / "release.manifest"),
             "-out", str(self.att / "release.sig")],
            check=True, capture_output=True,
        )

    def verify(self, commit=COMMIT):
        return subprocess.run(
            [sys.executable, str(VERIFIER), str(self.stage), commit,
             str(self.pub), str(self.att)],
            capture_output=True, text=True,
        )

    def assert_denied(self):
        result = self.verify()
        self.assertNotEqual(result.returncode, 0, result.stdout)
        self.assertIn("DENIED:", result.stderr)

    def test_valid_detached_signature(self):
        result = self.verify()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("M20_DETACHED_SIGNED_PREFLIGHT=PASS", result.stdout)
        self.assertFalse((self.stage / "deploy" / "release.sig").exists())

    def test_wrong_commit(self):
        self.assertNotEqual(self.verify("b" * 40).returncode, 0)

    def test_tampered_signature(self):
        with (self.att / "release.sig").open("ab") as f:
            f.write(b"x")
        self.assert_denied()

    def test_tampered_asset(self):
        self.asset.write_text("tampered")
        self.assert_denied()

    def test_tampered_manifest(self):
        self.manifest.write_text("0" * 64 + "  docs/assets/test.js\n")
        self.assert_denied()

    def test_signed_duplicate_entry_rejected(self):
        self.manifest.write_text(self.manifest.read_text() * 2)
        self.sign()
        self.assert_denied()

    def test_signed_path_traversal_rejected(self):
        self.manifest.write_text("0" * 64 + "  docs/assets/../index.html\n")
        self.sign()
        self.assert_denied()

    def test_signed_symlink_asset_rejected(self):
        other = self.root / "outside.js"
        other.write_bytes(self.asset.read_bytes())
        self.asset.unlink()
        self.asset.symlink_to(other)
        self.assert_denied()

    def test_signed_symlink_parent_rejected(self):
        other = self.root / "outside-assets"
        (self.stage / "docs" / "assets").rename(other)
        (self.stage / "docs" / "assets").symlink_to(other, target_is_directory=True)
        self.assert_denied()

    def test_missing_attestation_rejected(self):
        (self.att / "release.sig").unlink()
        self.assert_denied()

    def test_symlink_attestation_rejected(self):
        signature = self.att / "release.sig"
        external = self.root / "external.sig"
        signature.rename(external)
        signature.symlink_to(external)
        self.assert_denied()

    def test_unsigned_commit_change_rejected(self):
        self.assertNotEqual(self.verify("c" * 40).returncode, 0)


if __name__ == "__main__":
    unittest.main(verbosity=2)
