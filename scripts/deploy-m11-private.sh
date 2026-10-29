#!/usr/bin/env bash
set -euo pipefail
test "$(id -u)" -eq 0
test -f backend/m11_app.py
test -f backend/test_m11.py
test -f /opt/eons-m9/owner.env
test -x /opt/eons-m9/venv/bin/python
/opt/eons-m9/venv/bin/pip install 'httpx>=0.27,<1'
STAGE="$(mktemp -d)"
cp backend/m11_app.py "$STAGE/app.py"
cp backend/test_m11.py "$STAGE/test_m11.py"
(cd "$STAGE" && /opt/eons-m9/venv/bin/python test_m11.py)
install -d -m 755 /opt/eons-m11
install -m 644 backend/m11_app.py /opt/eons-m11/app.py
cat > /etc/systemd/system/eons-m11-private.service <<'UNIT'
[Unit]
Description=EONS M11 Private Session API
After=network.target
[Service]
Type=simple
User=eonsm9
Group=eonsm9
WorkingDirectory=/opt/eons-m11
EnvironmentFile=/opt/eons-m9/owner.env
ExecStart=/opt/eons-m9/venv/bin/uvicorn app:app --host 127.0.0.1 --port 18792 --no-access-log
Restart=on-failure
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
CapabilityBoundingSet=
UMask=0077
[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable --now eons-m11-private.service
systemctl restart eons-m11-private.service
sleep 2
curl -fsS http://127.0.0.1:18792/health
echo
CODE="$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:18792/session)"
test "$CODE" = 401
echo "M11_UNAUTHENTICATED_HTTP=$CODE"
echo "M11_PRIVATE=PASS"
