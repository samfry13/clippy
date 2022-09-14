FROM node:16-slim AS deps
RUN apt-get update && apt-get install -y openssl
WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma/schema.prisma ./prisma/
RUN npm ci


FROM node:16-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY .env.example ./.env
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build


FROM node:16-slim AS runner
RUN apt-get update && apt-get install -y ffmpeg openssl
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma/schema.prisma ./prisma/

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/entrypoint.sh ./init

ENV DATA_DIR="/data"

RUN mkdir -p /data && \
    chown -R node:node /data

VOLUME $DATA_DIR

ENV DATABASE_URL="file:$DATA_DIR/app.db"

EXPOSE 3000

ENV PORT 3000

ENTRYPOINT ["/app/init"]
CMD ["node", "server.js"]
