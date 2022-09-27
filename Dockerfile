########################
#         DEPS         #
########################

FROM node:16-slim AS deps
RUN apt-get update && apt-get install -y openssl
WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma/schema.prisma ./prisma/
RUN npm ci

########################
#        BUILDER       #
########################

FROM node:16-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY .env.example ./.env
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

# We need to set build args for required env vars.
# Next will yell at us if we don't have them at build time,
# but these will be dynamic at runtime anyway.
ARG DATA_DIR="/data"
ARG NEXTAUTH_SECRET="superdupersecret"
ARG NEXTAUTH_URL="https://example.com"
ARG EMAIL_SERVER_HOST="stmp.gmail.com"
ARG EMAIL_SERVER_USER="user1@gmail.com"
ARG EMAIL_SERVER_PASSWORD="supersecretpassword"
ARG EMAIL_SERVER_PORT="578"
ARG EMAIL_FROM="test@example.com"

RUN npm run build

########################
#        RUNNER        #
########################

FROM node:16-slim AS runner
RUN apt-get update && apt-get install -y ffmpeg openssl
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma/schema.prisma ./prisma/
COPY --from=builder /app/package.json ./package.json

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

COPY --from=builder /app/env.sh ./env.sh
COPY --from=builder /app/entrypoint.sh ./init

ENV DATA_DIR="/data"

RUN mkdir -p /data && \
    chown -R node:node /data

VOLUME "/data"

ENV DATABASE_URL="file:/data/app.db"
ENV INIT_DB="true"

EXPOSE 3000

ENV PORT 3000

ENTRYPOINT ["/app/init"]
CMD ["node", "server.js"]
