#!/bin/sh
set -e

[ -n "${PUID}" ] && usermod -o -u "${PUID}" node
[ -n "${PGID}" ] && groupmod -o -g "${PGID}" node

chown -R node:node "$DATA_DIR"

[ $INIT_DB ] && npm_config_yes=true runuser -u node -g node -- npx prisma db push --skip-generate --accept-data-loss

./env.sh

runuser -u node -g node -- "$@"

