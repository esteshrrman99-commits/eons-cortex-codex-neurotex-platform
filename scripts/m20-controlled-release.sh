#!/usr/bin/env bash
# M20.11E: signed, additive-only installer. DRAFT: do not activate before E2E tests.
set -Eeuo pipefail
umask 077
APP="${EONS_APP:-/opt/eons-tax-platform/source}"
LIVE="${EONS_LIVE:-$APP/docs}"
STATE="${EONS_STATE:-/opt/eons-tax-platform/m20}"
BASE="${EONS_BASE:-https://eons-tax.142-93-114-74.sslip.io}"
TRUSTED_KEY="${EONS_TRUSTED_PUBKEY:-/etc/eons-deploy/release-public.pem}"
ATTESTATION_DIR="${EONS_ATTESTATION_DIR:-}"
VERIFIER="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/m20-signed-preflight.py"
REF="${1:-}"
EXPECTED="${2:-}"
if [[ $# != 2 || ! "$REF" =~ ^[a-zA-Z0-9._/-]{1,100}$ || ! "$EXPECTED" =~ ^[0-9a-f]{40}$ ]]; then
  echo "DENIED: branch and exact commit required" >&2; exit 2
fi
for cmd in git python3 openssl flock curl tar; do command -v "$cmd" >/dev/null || exit 2; done
test -f "$VERIFIER" || { echo "DENIED: trusted verifier unavailable" >&2; exit 2; }
test -f "$TRUSTED_KEY" && test ! -L "$TRUSTED_KEY" || { echo "DENIED: trusted public key missing" >&2; exit 2; }
[[ "$ATTESTATION_DIR" == /* && -d "$ATTESTATION_DIR" && ! -L "$ATTESTATION_DIR" ]] || { echo "DENIED: detached signed attestation required" >&2; exit 2; }
[[ "$LIVE" == /* && "$STATE" == /* && ! -L "$LIVE" ]] || { echo "DENIED: unsafe deployment path" >&2; exit 2; }
test -d "$APP/.git" && test -s "$LIVE/index.html" && test -s "$LIVE/assets/eons-m17.css" || exit 2
# Refuse root execution: provision a dedicated least-privilege worker before use.
if [[ "$(id -u)" == 0 ]]; then echo "DENIED: root execution" >&2; exit 2; fi
mkdir -p "$STATE/backups" "$STATE/logs"
exec 9>"$STATE/deploy.lock"
flock -n 9 || { echo "DENIED: deployment in progress" >&2; exit 3; }
STAGE="$(mktemp -d "${TMPDIR:-/tmp}/eons-m20-release-XXXXXXXX")"
declare -a ADDED=()
declare -a TEMPS=()
COMMITTED=0
rollback() {
  local rel
  for rel in "${ADDED[@]}"; do rm -f -- "$LIVE/$rel" || true; done
  echo "M20_ROLLBACK=ATTEMPTED"
}
cleanup() {
  local status=$?
  trap - EXIT
  if [[ "$COMMITTED" != 1 && ${#ADDED[@]} -gt 0 ]]; then rollback; fi
  if [[ ${#TEMPS[@]} -gt 0 ]]; then rm -f -- "${TEMPS[@]}" || true; fi
  rm -rf -- "$STAGE"
  exit "$status"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
git -C "$APP" -c safe.directory="$APP" fetch --no-tags origin "refs/heads/$REF"
ACTUAL="$(git -C "$APP" -c safe.directory="$APP" rev-parse FETCH_HEAD)"
[[ "$ACTUAL" == "$EXPECTED" ]] || { echo "DENIED: commit mismatch" >&2; exit 4; }
git -C "$APP" -c safe.directory="$APP" archive "$ACTUAL" | tar -xf - -C "$STAGE"
python3 "$VERIFIER" "$STAGE" "$EXPECTED" "$TRUSTED_KEY" "$ATTESTATION_DIR" || exit 5
MANIFEST="$STAGE/deploy/m20-additive-manifest.sha256"
# Preflight all destinations BEFORE first write; refuse symlinked ancestors.
while IFS= read -r line; do
  rel="${line:66}"
  rel="${rel#docs/}"
  target="$LIVE/$rel"
  [[ ! -e "$target" && ! -L "$target" ]] || { echo "DENIED: existing file $rel" >&2; exit 6; }
  parent="$(dirname "$target")"
  while [[ "$parent" != "$LIVE" ]]; do
    [[ ! -L "$parent" ]] || { echo "DENIED: symlinked destination ancestor" >&2; exit 6; }
    parent="$(dirname "$parent")"
  done
done < "$MANIFEST"
RELEASE="$STATE/backups/$(date -u +%Y%m%dT%H%M%SZ)-${ACTUAL:0:12}-$$"
mkdir -p "$RELEASE"
while IFS= read -r line; do
  rel="${line:66}"
  rel="${rel#docs/}"
  target="$LIVE/$rel"
  [[ -d "$(dirname "$target")" && ! -L "$(dirname "$target")" ]] || { echo "DENIED: destination directory unavailable" >&2; exit 6; }
  # Write a complete temporary file before atomically creating the final name.
  # ln fails if the target already exists; it never replaces an existing file.
  tmp="$(mktemp "$(dirname "$target")/.eons-m20-XXXXXXXX")"
  TEMPS+=("$tmp")
  cat -- "$STAGE/docs/$rel" > "$tmp"
  chmod 0644 "$tmp"
  ln -- "$tmp" "$target" || exit 6
  ADDED+=("$rel")
  rm -f -- "$tmp"
done < "$MANIFEST"
for rel in "${ADDED[@]}"; do
  code="$(curl --max-time 12 -sS -o /dev/null -w '%{http_code}' "$BASE/$rel")"
  echo "CHECK=$rel HTTP=$code"
  [[ "$code" == 200 ]] || exit 7
done
for rel in / /assets/eons-m17.css /pages/financial-dashboard.html /pages/reconciliation-lab.html; do
  code="$(curl --max-time 12 -sS -o /dev/null -w '%{http_code}' "$BASE$rel")"
  [[ "$code" == 200 ]] || exit 8
done
printf '%s\n' "${ADDED[@]}" > "$RELEASE/added-files.txt"
printf '%s %s\n' "$REF" "$ACTUAL" > "$RELEASE/source.txt"
COMMITTED=1
echo "M20_SIGNED_ADDITIVE_RELEASE=PASS"
echo "M20_RELEASE=$RELEASE"
