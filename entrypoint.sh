#!/bin/sh
set -e

[ $INIT_DB ] && npm_config_yes=true npx prisma db push --skip-generate

exec "$@"

