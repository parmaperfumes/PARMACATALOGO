#!/bin/sh
# Deploy automático por polling: corre cada minuto en el servidor de Coolify.
# Si `main` en GitHub tiene un commit nuevo, le pide a Coolify que despliegue
# Parma Web. El repositorio es público, así que leer GitHub no pide claves.
# Lo instala instalar.sh (temporizador de systemd «parma-autodeploy»).

REPO_URL="https://github.com/parmaperfumes/PARMACATALOGO.git"
RAMA="main"
COOLIFY_URL="http://localhost:8000"
APP_UUID="h9zjs8vznz6ttc7bf4r4vz9f" # Parma Web en Coolify

DIR="/etc/parma-autodeploy"
TOKEN_FILE="$DIR/token"
ULTIMO_FILE="$DIR/ultimo-commit"

log() { echo "$(date '+%Y-%m-%d %H:%M:%S') $*"; }

[ -r "$TOKEN_FILE" ] || { log "falta el token en $TOKEN_FILE"; exit 1; }

# El último commit de la rama, sin necesitar git instalado.
SHA=$(curl -fsS --max-time 20 "$REPO_URL/info/refs?service=git-upload-pack" \
	| grep -ao "[0-9a-f]\{40\} refs/heads/$RAMA\$" | cut -d' ' -f1)
[ -n "$SHA" ] || { log "no se pudo leer GitHub"; exit 0; }

ULTIMO=$(cat "$ULTIMO_FILE" 2>/dev/null)
[ "$SHA" = "$ULTIMO" ] && exit 0

log "commit nuevo en $RAMA: $SHA (antes: ${ULTIMO:-ninguno}); pidiendo deploy"
RESPUESTA=$(curl -fsS --max-time 30 \
	-H "Authorization: Bearer $(cat "$TOKEN_FILE")" \
	"$COOLIFY_URL/api/v1/deploy?uuid=$APP_UUID&force=false") || {
	log "Coolify rechazó el pedido; se reintenta en el próximo minuto"
	exit 1
}
# Se guarda sólo si Coolify aceptó: así un fallo de red se reintenta solo,
# pero un build roto no se repite cada minuto.
echo "$SHA" > "$ULTIMO_FILE"
log "Coolify: $RESPUESTA"
