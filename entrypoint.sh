#!/bin/sh
set -e

[ -n "${PUID}" ] && usermod -o -u "${PUID}" node
[ -n "${PGID}" ] && groupmod -o -g "${PGID}" node

[ $INIT_DB ] && npm_config_yes=true su-exec node:node npx prisma db push --skip-generate

exec su-exec node:node "$@"

