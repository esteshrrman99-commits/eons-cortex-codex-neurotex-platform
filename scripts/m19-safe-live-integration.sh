#!/usr/bin/env bash
# M19 additive live navigation integration. No checkout replacement or production rebuild.
set -euo pipefail
APP="${EONS_APP:-/opt/eons-tax-platform/source}"
LIVE="$APP/docs"
REF="${EONS_REF:-eons-m19-safe-live-integration-20261029}"
BASE="${EONS_BASE:-https://eons-tax.142-93-114-74.sslip.io}"
test -s "$LIVE/index.html"
test -s "$LIVE/assets/eons-m17.css"
test -s "$LIVE/pages/reconciliation-lab.html"
test -s "$LIVE/assets/m18-reconciliation.js"
command -v python3 >/dev/null
command -v curl >/dev/null
command -v git >/dev/null
STAGE="$(mktemp -d /tmp/eons-m19-XXXXXXXX)"
BACKUP=""
cleanup(){ rm -rf "$STAGE"; }
trap cleanup EXIT
cd "$APP"
git -c safe.directory="$APP" fetch --no-tags origin "$REF"
git -c safe.directory="$APP" archive FETCH_HEAD | tar -xf - -C "$STAGE"
test -s "$STAGE/scripts/m19-safe-live-integration.sh"
python3 - "$LIVE/index.html" "$STAGE" <<'PY'
from pathlib import Path
import sys
html=Path(sys.argv[1]).read_text()
assert '</body>' in html.lower(), 'Missing body close; refuse mutation'
assert '/pages/reconciliation-lab.html' not in html or 'EONS_M19_NAV' in html, 'Existing link unmanaged; inspect manually'
assert 'eons-m17.css' in html, 'M17 style missing; refuse mutation'
print('M19_PREFLIGHT=PASS')
PY
BACKUP="/opt/eons-tax-platform/backup-M19-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP"
cp -a "$LIVE/index.html" "$BACKUP/index.html"
python3 - "$LIVE/index.html" <<'PY'
from pathlib import Path
import sys
p=Path(sys.argv[1])
html=p.read_text()
marker='<!-- EONS_M19_NAV -->'
if marker in html:
    print('M19_NAV_ALREADY_PRESENT=YES')
else:
    block='''\n<!-- EONS_M19_NAV -->\n<nav aria-label="M19 financial intelligence" class="eons-m19-nav"><a href="/pages/reconciliation-lab.html">Financial Reconciliation Lab <span aria-hidden="true">↗</span></a></nav>\n<style id="eons-m19-style">.eons-m19-nav{position:relative;z-index:10;max-width:1100px;margin:1rem auto;padding:0 1rem}.eons-m19-nav a{display:block;padding:1.05rem 1.3rem;border:1px solid rgba(212,175,105,.6);border-radius:16px;background:linear-gradient(120deg,rgba(8,22,38,.94),rgba(53,36,31,.88));color:#fff1d6;font:600 1rem system-ui,sans-serif;text-decoration:none;box-shadow:0 10px 30px rgba(0,0,0,.25)}.eons-m19-nav a:hover,.eons-m19-nav a:focus-visible{outline:2px solid #e7bc83;outline-offset:3px}</style>\n'''
    index=html.lower().rfind('</body>')
    assert index>=0
    tmp=p.with_suffix('.m19.tmp')
    tmp.write_text(html[:index]+block+html[index:])
    tmp.replace(p)
    print('M19_NAV_INSTALLED=YES')
PY
if ! curl -fsS "$BASE/" | grep -q 'EONS_M19_NAV'; then
  cp -a "$BACKUP/index.html" "$LIVE/index.html"
  echo "M19_ROLLBACK=RESTORED"
  exit 1
fi
for route in / /assets/eons-m17.css /assets/eons-m17.js /assets/eons-brand-logo.webp /pages/financial-dashboard.html /pages/reconciliation-lab.html /assets/m18-reconciliation.js; do
  code="$(curl -sS -o /dev/null -w '%{http_code}' "$BASE$route")"
  echo "CHECK=$route HTTP=$code"
  if [ "$code" != 200 ]; then
    cp -a "$BACKUP/index.html" "$LIVE/index.html"
    echo "M19_ROLLBACK=RESTORED"
    exit 1
  fi
done
echo "M19_LIVE_INTEGRATION=PASS"
echo "M19_BACKUP=$BACKUP"
