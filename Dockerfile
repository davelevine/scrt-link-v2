# syntax=docker/dockerfile:1
#
# Multi-stage build for the self-hosted (adapter-node) deployment. Images are
# built in GitHub Actions and published to ghcr.io; xenlab pulls by digest.
#
# Secrets are NOT baked in. Everything the app reads through $env/dynamic/private
# (POSTGRES_URL, S3 keys, CRON_SECRET, LETTERMINT_TOKEN, RATE_LIMIT_COOKIE_SECRET,
# EMAIL_FROM) is injected at runtime. Only the non-secret PUBLIC_* config below is
# inlined at build time, because SvelteKit resolves $env/static/public then.

FROM node:24-alpine AS builder

WORKDIR /app
RUN corepack enable

COPY . .
RUN pnpm install --frozen-lockfile

# Non-secret public config — inlined into the client+server bundle at build time
# ($env/static/public). Supplied as build args by the CI workflow.
ARG PUBLIC_ENV=production
ARG PUBLIC_PRODUCTION_URL
ARG PUBLIC_S3_ENDPOINT
ARG PUBLIC_S3_BUCKET
ARG PUBLIC_S3_KEY_PREFIX=scrt-link/
ENV PUBLIC_ENV=$PUBLIC_ENV \
    PUBLIC_PRODUCTION_URL=$PUBLIC_PRODUCTION_URL \
    PUBLIC_S3_ENDPOINT=$PUBLIC_S3_ENDPOINT \
    PUBLIC_S3_BUCKET=$PUBLIC_S3_BUCKET \
    PUBLIC_S3_KEY_PREFIX=$PUBLIC_S3_KEY_PREFIX

# Select the Node adapter (svelte.config.js branches on this).
ENV ADAPTER=node

# SvelteKit's build-time route analysis imports server modules, and the DB module
# (src/lib/server/db) throws if POSTGRES_URL is unset. No database connection is
# made during the build — this placeholder only lets the analyse pass complete.
# The real DSN is injected at runtime via $env/dynamic/private.
ENV POSTGRES_URL="postgres://build:build@127.0.0.1:5432/build"

RUN pnpm build

# Materialize a self-contained production node_modules: workspace packages
# resolved to real paths, devDependencies pruned. `node build` needs the
# externalized runtime deps (postgres, drizzle-orm, @aws-sdk, axios, ...).
RUN pnpm --filter=scrt-link-v2 deploy --prod --legacy /prod

FROM node:24-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /prod/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json

# Drop privileges — the node image ships an unprivileged `node` user (uid 1000).
USER node

EXPOSE 3000
CMD ["node", "build"]
