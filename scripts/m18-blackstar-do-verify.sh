#!/usr/bin/env bash
# EONS M18 independent BLACKSTAR/DigitalOcean verification.
# Never runs npm build in the production checkout.
set -euo pipefail
REPO="${EONS_REPO:-/opt/eons-tax-platform/source}"
REF="${EONS_REF:-eons-m18-safe-reconciliation-core-20261029}"
WORK="$(mktemp -d /tmp/eons-m18-verify-XXXXXXXX)"
cleanup(){ rm -rf "$WORK"; }
trap cleanup EXIT
command -v git >/dev/null
command -v node >/dev/null
command -v npm >/dev/null
test -d "$REPO/.git"
echo "EONS_VERIFY_MODE=ISOLATED_READ_ONLY_PRODUCTION"
echo "NODE_VERSION=$(node --version)"
cd "$REPO"
git -c safe.directory="$REPO" fetch --no-tags origin "$REF"
git -c safe.directory="$REPO" archive FETCH_HEAD | tar -xf - -C "$WORK"
cd "$WORK"
node --check public/assets/m18-reconciliation.js
node --check src/evidence-provenance.js
node --check src/tax-rule-registry.js
node --test tests/m18-*.test.js
npm run build
npm run verify
test -s docs/pages/reconciliation-lab.html
test -s docs/assets/m18-reconciliation.js
grep -q 'DEMO / NO LIVE DATA' docs/pages/reconciliation-lab.html
echo "EONS_M18_INDEPENDENT_VERIFY=PASS"
echo "PRODUCTION_FILES_MODIFIED=NO"
