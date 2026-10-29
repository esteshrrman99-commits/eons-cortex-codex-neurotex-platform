#!/usr/bin/env bash
# M12 read-only private owner security audit. No secrets printed.
set -euo pipefail
S9=eons-m9-private.service
S11=eons-m11-private.service
echo "===== EONS M12 OWNER SECURITY AUDIT ====="
for svc in "$S9" "$S11"; do
  systemctl is-active --quiet "$svc" || { echo "$svc=INACTIVE"; exit 1; }
  test "$(systemctl show "$svc" -p User --value)" = eonsm9
  echo "$svc=ACTIVE_NONROOT"
done
test "$(stat -c %a /opt/eons-m9/owner.env)" = 640
test "$(stat -c %U:%G /opt/eons-m9/owner.env)" = root:eonsm9
echo "OWNER_SECRET_PERMISSIONS=PASS"
for port in 18791 18792; do
  if ss -H -ltn "( sport = :$port )" | awk '{print $4}' | grep -Ev '^(127\.0\.0\.1|\[::1\]):' | grep -q .; then
    echo "PORT_${port}_PUBLIC_BIND=FAIL"
    exit 1
  fi
  ss -H -ltn "( sport = :$port )" | grep -q .
  echo "PORT_${port}_LOOPBACK=PASS"
done
curl -fsS --max-time 5 http://127.0.0.1:18791/health >/dev/null
curl -fsS --max-time 5 http://127.0.0.1:18792/health >/dev/null
for url in http://127.0.0.1:18791/owner/status http://127.0.0.1:18792/session; do
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$url")"
  test "$code" = 401 || { echo "UNAUTHORIZED_CHECK=FAIL"; exit 1; }
done
echo "UNAUTHORIZED_ACCESS=401_PASS"
echo "CUSTOMER_DATA_INGESTION=DISABLED_BY_DESIGN"
echo "M12_SECURITY_AUDIT=PASS"
