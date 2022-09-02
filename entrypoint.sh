#!/bin/sh
set -e

[ $INIT_DB ] && npx prisma db push --skip-generate

exec "$@"

