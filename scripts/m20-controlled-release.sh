#!/usr/bin/env bash
# EONS M20: fail-closed, operator-approved additive static release installer.
# No arbitrary code execution from a release, no GitHub Actions dependency.
set -euo pipefail
umask 077
APP="${EONS_APP:-/opt/eons-tax-platform/source}"
LIVE="$APP/docs"
STATE="/opt/eons-tax-platform/m20"
BASE="https://eons-tax.142-93-114-74.sslip.io"
REF="${1:-}"
EXPECTED="${2:-}"
APPROVAL="${3:-}"
if [[ ! "$REF" =~ ^[a-zA-Z0-9._/-]{1,100}$ || ! "$EXPECTED" =~ ^[0-9a-f]{40}$ || "$APPROVAL" != "APPROVE_M20_ADDITIVE" ]]; then
  echo "DENIED: supply branch, exact 40-character commit SHA, and APPROVE_M20_ADDITIVE" >&2; exit 2
fi
command -v git >/dev/null; command -v sha256sum >/dev/null; command -v curl >/dev/null
test -d "$APP/.git"; test -s "$LIVE/index.html"; test -s "$LIVE/assets/eons-m17.css"
mkdir -p "$STATE/backups" "$STATE/logs"
exec 9>"$STATE/deploy.lock"
flock -n 9 || { echo "DENIED: deployment in progress"; exit 3; }
STAGE="$(mktemp -d /tmp/eons-m20-release-XXXXXXXX)"
trap 'rm -rf "$STAGE"' EXIT
cd "$APP"
git -c safe.directory="$APP" fetch --no-tags origin "$REF"
ACTUAL="$(git -c safe.directory="$APP" rev-parse FETCH_HEAD)"
test "$ACTUAL" = "$EXPECTED" || { echo "DENIED: commit mismatch"; exit 4; }
git -c safe.directory="$APP" archive "$ACTUAL" | tar -xf - -C "$STAGE"
MANIFEST="$STAGE/deploy/m20-additive-manifest.sha256"
test -s "$MANIFEST" || { echo "DENIED: no manifest"; exit 5; }
# Manifest lines: SHA256 (two spaces) docs/relative/path. No HTML replacement allowed.
python3 - "$MANIFEST" <<'PY'
import pathlib,re,sys
lines=pathlib.Path(sys.argv[1]).read_text().splitlines()
assert 0<len(lines)<=20
seen=set()
for line in lines:
    m=re.fullmatch(r'([0-9a-f]{64})  (docs/(?:assets|pages)/[a-zA-Z0-9._/-]+)',line)
    assert m, 'Invalid manifest entry'
    p=pathlib.PurePosixPath(m[2])
    assert '..' not in p.parts and p.as_posix() not in seen
    assert p.suffix in ('.html','.js','.css','.webp','.png','.svg')
    seen.add(p.as_posix())
PY
(cd "$STAGE" && sha256sum -c "$MANIFEST")
RELEASE="$STATE/backups/$(date -u +%Y%m%dT%H%M%SZ)-${ACTUAL:0:12}"
mkdir -p "$RELEASE"
declare -a ADDED=()
rollback(){
  for rel in "${ADDED[@]}"; do rm -f -- "$LIVE/$rel"; done
  echo "M20_ROLLBACK=REMOVED_NEW_FILES"
}
while IFS= read -r line; do
  rel="${line:66}" # remove 64 hex characters + two spaces
  rel="${rel#docs/}"
  test ! -e "$LIVE/$rel" || { echo "DENIED: existing file $rel"; rollback; exit 6; }
  mkdir -p "$(dirname "$LIVE/$rel")"
  install -m 0644 "$STAGE/docs/$rel" "$LIVE/$rel"
  ADDED+=("$rel")
done < "$MANIFEST"
for rel in "${ADDED[@]}"; do
  code="$(curl --max-time 12 -sS -o /dev/null -w '%{http_code}' "$BASE/$rel")"
  echo "CHECK=$rel HTTP=$code"
  if [[ "$code" != "200" ]]; then rollback; exit 7; fi
done
for rel in / /assets/eons-m17.css /pages/financial-dashboard.html /pages/reconciliation-lab.html; do
  code="$(curl --max-time 12 -sS -o /dev/null -w '%{http_code}' "$BASE$rel")"
  if [[ "$code" != "200" ]]; then rollback; exit 8; fi
done
printf '%s\n' "${ADDED[@]}" > "$RELEASE/added-files.txt"
printf '%s %s\n' "$REF" "$ACTUAL" > "$RELEASE/source.txt"
echo "M20_ADDITIVE_RELEASE=PASS"
echo "M20_RELEASE=$RELEASE"
