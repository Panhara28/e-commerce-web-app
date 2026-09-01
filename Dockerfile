# syntax=docker/dockerfile:1

# ---- deps ----
FROM node:22-slim AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ---- build ----
FROM node:22-slim AS build
WORKDIR /app
RUN corepack enable
ENV NEXT_TELEMETRY_DISABLED=1
# Public URL is inlined into the client bundle at build time.
ARG NEXT_PUBLIC_API_BASE_URL=https://api.tsportcambodia.com/api
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

# ---- runtime ----
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=4000
ENV HOSTNAME=0.0.0.0
RUN useradd -m nextjs
COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nextjs /app/.next/static ./.next/static
# The deploy tooling runs the container read-only with only /tmp writable, so
# redirect Next's runtime cache there. The entrypoint creates the target dir
# (the build-time /tmp is hidden by the runtime tmpfs mount).
RUN mkdir -p /app/.next \
 && ln -sfn /tmp/next-cache/admin /app/.next/cache \
 && printf '#!/bin/sh\nmkdir -p /tmp/next-cache/admin\nexec node server.js\n' > /app/entrypoint.sh \
 && chmod 755 /app/entrypoint.sh
USER nextjs
EXPOSE 4000
CMD ["/app/entrypoint.sh"]
