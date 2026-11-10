#!/bin/bash
# Instala el deploy automático de Parma Web en el servidor de Coolify.
# Uso (en el servidor):
#   curl -fsSL https://raw.githubusercontent.com/parmaperfumes/PARMACATALOGO/main/scripts/coolify-autodeploy/instalar.sh -o /tmp/instalar.sh && sudo bash /tmp/instalar.sh
# Pide el token de API de Coolify (no se ve al pegarlo) y deja un temporizador
# de systemd que corre revisar.sh cada minuto.
set -euo pipefail

[ "$(id -u)" -eq 0 ] || { echo "Córrelo con sudo."; exit 1; }

BASE="https://raw.githubusercontent.com/parmaperfumes/PARMACATALOGO/main/scripts/coolify-autodeploy"
DIR="/etc/parma-autodeploy"
mkdir -p "$DIR"
chmod 700 "$DIR"

curl -fsSL "$BASE/revisar.sh" -o /usr/local/bin/parma-autodeploy
chmod 755 /usr/local/bin/parma-autodeploy

if [ ! -s "$DIR/token" ]; then
	read -rsp "Pega el token de API de Coolify y pulsa Enter: " TOKEN </dev/tty
	echo
	[ -n "$TOKEN" ] || { echo "No se pegó ningún token."; exit 1; }
	umask 077
	printf '%s' "$TOKEN" > "$DIR/token"
	unset TOKEN
fi
chmod 600 "$DIR/token"

cat > /etc/systemd/system/parma-autodeploy.service <<'EOF'
[Unit]
Description=Parma Web: deploy en Coolify si hay commit nuevo en GitHub
After=network-online.target

[Service]
Type=oneshot
ExecStart=/usr/local/bin/parma-autodeploy
EOF

cat > /etc/systemd/system/parma-autodeploy.timer <<'EOF'
[Unit]
Description=Revisa GitHub cada minuto para Parma Web

[Timer]
OnBootSec=1min
OnUnitActiveSec=1min
AccuracySec=5s

[Install]
WantedBy=timers.target
EOF

systemctl daemon-reload
systemctl enable --now parma-autodeploy.timer
systemctl start parma-autodeploy.service || true

echo
echo "Listo. Último registro:"
journalctl -u parma-autodeploy.service -n 5 --no-pager
echo
echo "Para ver el historial: journalctl -u parma-autodeploy -f"
