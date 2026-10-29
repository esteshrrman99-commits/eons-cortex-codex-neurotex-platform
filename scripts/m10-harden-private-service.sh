#!/usr/bin/env bash
set -euo pipefail
[ "$(id -u)" -eq 0 ] || { echo "Run with sudo"; exit 1; }
SERVICE=eons-m9-private.service
BASE=/opt/eons-m9
test -f "$BASE/current/app.py"
test -f "$BASE/owner.env"
test -x "$BASE/venv/bin/uvicorn"
id eonsm9 >/dev/null 2>&1 || useradd --system --home-dir /nonexistent --shell /usr/sbin/nologin --no-create-home eonsm9
BACKUP="/etc/systemd/system/${SERVICE}.backup-$(date +%Y%m%d-%H%M%S)"
cp -a "/etc/systemd/system/$SERVICE" "$BACKUP"
echo "UNIT_BACKUP=$BACKUP"
install -d -o eonsm9 -g eonsm9 -m 700 /var/lib/eons-m9
chown -R eonsm9:eonsm9 /var/lib/eons-m9
chmod 700 /var/lib/eons-m9
test ! -e /var/lib/eons-m9/audit.sqlite3 || chmod 600 /var/lib/eons-m9/audit.sqlite3
chown root:eonsm9 "$BASE/owner.env"
chmod 640 "$BASE/owner.env"
chmod 755 "$BASE" "$BASE/current" "$BASE/venv"
mkdir -p "/etc/systemd/system/$SERVICE.d"
cat > "/etc/systemd/system/$SERVICE.d/10-hardening.conf" <<'UNIT'
[Service]
User=eonsm9
Group=eonsm9
UMask=0077
CapabilityBoundingSet=
AmbientCapabilities=
RestrictSUIDSGID=true
RestrictAddressFamilies=AF_INET AF_INET6 AF_UNIX
ProtectKernelTunables=true
ProtectKernelModules=true
ProtectControlGroups=true
LockPersonality=true
SystemCallArchitectures=native
UNIT
systemctl daemon-reload
systemctl restart "$SERVICE"
sleep 2
systemctl is-active --quiet "$SERVICE"
USER_NOW="$(systemctl show -p User --value "$SERVICE")"
test "$USER_NOW" = eonsm9
curl -fsS --max-time 5 http://127.0.0.1:18791/health
echo
CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 http://127.0.0.1:18791/owner/status)"
test "$CODE" = 401
echo "OWNER_UNAUTHENTICATED_HTTP=$CODE"
echo "SERVICE_USER=$USER_NOW"
echo "M10_HARDENING=PASS"
