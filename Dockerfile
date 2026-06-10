# ── Production image — multi-stage ────────────────────────────────────────────
#
# Stage 1  deps     Install production + dev dependencies
# Stage 2  builder  Run `next build` with standalone output
# Stage 3  runner   Minimal runtime image (~200 MB)
#
# Requires next.config.ts to have `output: "standalone"`.

ARG NODE_VERSION=20
ARG ALPINE_VERSION=3.21

# ── Stage 1: deps ─────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json package-lock.json* ./

# Install all deps (devDependencies are required by next build / Tailwind).
RUN npm ci

# ── Stage 2: builder ──────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS builder

WORKDIR /app

# Bring in installed modules from deps stage.
COPY --from=deps /app/node_modules ./node_modules

# Copy full source.
COPY . .

# Build-time env vars. NEXT_PUBLIC_* values are inlined into the JS bundle at
# build time — set them here or pass them with --build-arg.
ARG NEXT_PUBLIC_API_URL=""
ARG NEXT_PUBLIC_SITE_URL="https://footballke.com"
ARG NEXT_PUBLIC_ANALYTICS_ID=""

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_ANALYTICS_ID=${NEXT_PUBLIC_ANALYTICS_ID}

# Disable Next.js telemetry inside CI/Docker.
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ── Stage 3: runner ───────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS runner

RUN apk add --no-cache wget

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Create a non-root user before copying files so chown is done in one layer.
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copy only what the standalone server needs.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static   ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public         ./public

USER nextjs

EXPOSE 3000

# next start in standalone mode is a plain Node.js process — no npm overhead.
CMD ["node", "server.js"]

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1
