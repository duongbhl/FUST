#!/usr/bin/env bash
set -euo pipefail

# fix_nodebb_permissions.sh
# Summary: Backup `docker-compose.yml`, remove host bind `driver_opts` for
# nodebb-config, nodebb-build, nodebb-uploads (so Docker will create writable
# named volumes), optionally chown host .docker folders, and restart compose.
# Usage: sudo ./fix_nodebb_permissions.sh [NODEBB_DIR] [--chown]
#   NODEBB_DIR defaults to current directory.
#   --chown: also chown host folders to the invoking user (requires root).

DIR="${1:-.}"
DO_CHOWN=0
if [ "${2:-}" = "--chown" ]; then
  DO_CHOWN=1
fi

COMPOSE_FILE="$DIR/docker-compose.yml"
if [ ! -f "$COMPOSE_FILE" ]; then
  echo "docker-compose.yml not found in $DIR" >&2
  exit 1
fi

bak="$COMPOSE_FILE.bak.$(date +%s)"
cp -p "$COMPOSE_FILE" "$bak"
echo "Backed up $COMPOSE_FILE -> $bak"

# Ensure expected bind-mount directories exist for databases and uploads
mkdir -p "$DIR/.docker/database/mongo/data" \
  "$DIR/.docker/database/redis" \
  "$DIR/.docker/database/postgresql/data" \
  "$DIR/.docker/public/uploads"
chmod 777 "$DIR/.docker/public/uploads" || true
echo "Ensured database and uploads directories exist"

# Remove driver_opts blocks under target volumes by parsing indentation
awk '
BEGIN {
  targets["nodebb-config"]=1; targets["nodebb-build"]=1;
  in_volumes=0; cur_vol=""; skip=0; skip_indent=0;
}
{
  line=$0
  if (in_volumes==0 && line ~ /^volumes:\s*$/) { in_volumes=1; print line; next }
  if (in_volumes==1) {
    if (match(line,/^[[:space:]]{2,}[^[:space:]]+:\s*$/)) {
      # volume header
      sub(/^[[:space:]]*/,"",line)
      cur_vol=substr(line,1,index(line,":")-1)
      print $0
      next
    }
    if (cur_vol in targets && line ~ /^[[:space:]]*driver_opts:\s*$/) {
      # start skipping driver_opts block
      m = match($0,/[^ ]/)
      if (m==0) { indent=0 } else { indent = m-1 }
      skip=1; skip_indent=indent; next
    }
    if (skip==1) {
      m = match($0,/[^ ]/)
      if (m==0) { indent=0 } else { indent = m-1 }
      if (indent <= skip_indent && $0 !~ /^[[:space:]]*$/) { skip=0; print $0; next }
      # else continue skipping
      next
    }
  }
  print $0
}
' "$COMPOSE_FILE" > "$COMPOSE_FILE.tmp"

mv "$COMPOSE_FILE.tmp" "$COMPOSE_FILE"
echo "Updated $COMPOSE_FILE (removed host bind driver_opts for NodeBB volumes)"

if [ "$DO_CHOWN" -eq 1 ]; then
  echo "Changing ownership of host .docker folders to invoking user"
  # chown to UID:GID of the invoking user (if run with sudo, SUDO_UID/SUDO_GID used)
  if [ -n "${SUDO_UID:-}" ]; then
    TARGET_UID=$SUDO_UID; TARGET_GID=$SUDO_GID
  else
    TARGET_UID=$(id -u); TARGET_GID=$(id -g)
  fi
  sudo chown -R "$TARGET_UID:$TARGET_GID" "$DIR/.docker/public/uploads" || true
  sudo chmod -R 777 "$DIR/.docker/public/uploads" || true
  sudo chown -R "$TARGET_UID:$TARGET_GID" \
    "$DIR/.docker/database/mongo" \
    "$DIR/.docker/database/redis" \
    "$DIR/.docker/database/postgresql" || true
  echo "chown completed (if paths existed)"
fi

# Ensure Traefik ACME file exists with secure permissions for Let's Encrypt
TRAEFIK_DIR="$DIR/traefik"
ACME_FILE="$TRAEFIK_DIR/acme.json"
mkdir -p "$TRAEFIK_DIR"
if [ -d "$ACME_FILE" ]; then
  rm -rf "$ACME_FILE"
fi
if [ ! -f "$ACME_FILE" ]; then
  : > "$ACME_FILE"
fi
chmod 600 "$ACME_FILE" || true
if [ "$DO_CHOWN" -eq 1 ]; then
  sudo chown "$TARGET_UID:$TARGET_GID" "$ACME_FILE" || true
fi
echo "Ensured Traefik ACME file at $ACME_FILE with mode 600"

# Restart Docker Compose (try v2 `docker compose` first, then legacy `docker-compose`)
cd "$DIR"
if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  DCMD=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  DCMD=(docker-compose)
else
  echo "No docker compose command found (need 'docker compose' or 'docker-compose'). Exiting." >&2
  exit 0
fi

echo "Stopping and recreating compose services using: ${DCMD[*]}"
"${DCMD[@]}" down || true
"${DCMD[@]}" up -d --build --force-recreate
echo "Recreated services. Showing last 200 lines of nodebb logs:"
"${DCMD[@]}" logs nodebb --tail=200 || true

echo "Done. If you prefer host bind mounts instead of named volumes, run:"
echo "  sudo chown -R <UID>:<GID> $DIR/.docker/public/uploads"
