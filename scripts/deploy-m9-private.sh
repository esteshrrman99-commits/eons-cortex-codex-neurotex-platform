#!/usr/bin/env bash
set -euo pipefail
test "$(id -u)" -eq 0 || { echo "Run as root"; exit 1; }
test -f backend/app.py || { echo "Run from staged repository root"; exit 1; }
command -v python3 >/dev/null
python3 -m venv --help >/dev/null
BASE=/opt/eons-m9
mkdir -p "$BASE" /var/lib/eons-m9
chmod 700 /var/lib/eons-m9
if test -d "$BASE/current"; then
  cp -a "$BASE/current" "$BASE/backup-$(date +%Y%m%d-%H%M%S)"
fi
python3 -m venv "$BASE/venv"
"$BASE/venv/bin/pip" install --disable-pip-version-check -r backend/requirements.txt
mkdir -p "$BASE/current"
install -m 600 backend/app.py "$BASE/current/app.py"
if ! test -s "$BASE/owner.env"; then
  umask 077
  TOKEN="$(python3 -c 'import secrets;print(secrets.token_urlsafe(48))')"
  printf 'EONS_M9_OWNER_TOKEN=%s\nEONS_M9_DB=/var/lib/eons-m9/audit.sqlite3\n' "$TOKEN" > "$BASE/owner.env"
  unset TOKEN
fi
chmod 600 "$BASE/owner.env"
cat > /etc/systemd/system/eons-m9-private.service <<'UNIT'
[Unit]
Description=EONS M9 Private Foundation API
After=network.target
[Service]
Type=simple
User=root
WorkingDirectory=/opt/eons-m9/current
EnvironmentFile=/opt/eons-m9/owner.env
ExecStart=/opt/eons-m9/venv/bin/uvicorn app:app --host 127.0.0.1 --port 18791 --no-access-log
Restart=on-failure
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ReadWritePaths=/var/lib/eons-m9
ProtectHome=true
[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable --now eons-m9-private.service
systemctl restart eons-m9-private.service
sleep 2
curl --fail --silent --show-error http://127.0.0.1:18791/health
printf '\nM9_PRIVATE_SERVICE=STARTED\nOWNER_TOKEN=STORED_ON_SERVER_ONLY\nPUBLIC_EXPOSURE=NOT_CONFIGURED\n'
