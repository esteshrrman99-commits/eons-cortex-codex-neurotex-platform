#!/usr/bin/env bash
# M18 read-only production/source divergence audit. No secret output or file writes.
set -euo pipefail
APP="${EONS_APP:-/opt/eons-tax-platform/source}"
DOMAIN="${EONS_DOMAIN:-eons-tax.142-93-114-74.sslip.io}"
test -d "$APP/docs" || { echo "ERROR: deployed docs not found"; exit 2; }
echo "EONS_M18_LIVE_AUDIT=START"
printf 'HOST=%s\n' "$(hostname)"
for f in index.html assets/eons-m16.css assets/eons-m17.css assets/eons-m17.js assets/eons-brand-logo.webp pages/financial-dashboard.html pages/reconciliation-lab.html; do
 if test -s "$APP/docs/$f"; then echo "DEPLOYED_FILE_PRESENT=$f"; else echo "DEPLOYED_FILE_MISSING=$f"; fi
done
if test -s "$APP/public/index.html"; then
 if cmp -s "$APP/public/index.html" "$APP/docs/index.html"; then
  echo "SOURCE_LIVE_INDEX_PARITY=YES"
 else
  echo "SOURCE_LIVE_INDEX_PARITY=NO"
 fi
else
 echo "SOURCE_LIVE_INDEX_PARITY=UNKNOWN_NO_PUBLIC_SOURCE"
fi
for route in / /assets/eons-m17.css /pages/financial-dashboard.html /pages/reconciliation-lab.html; do
 code=$(curl --silent --show-error --max-time 12 -o /dev/null -w '%{http_code}' "https://$DOMAIN$route" || true)
 printf 'PUBLIC_HTTP=%s %s\n' "$code" "$route"
done
for service in eons-m9-private.service eons-m11-private.service; do
 printf 'SERVICE=%s %s\n' "$service" "$(systemctl is-active "$service" 2>/dev/null || true)"
done
echo "EONS_M18_LIVE_AUDIT=COMPLETE_READ_ONLY"
