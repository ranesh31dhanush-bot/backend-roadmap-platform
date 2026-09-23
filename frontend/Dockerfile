# =============================================================================
# Frontend — Multi-Stage Production Dockerfile
# HARD-001: Sprint 11 Production Hardening
# =============================================================================
#
# Stage 1: deps      — installs all dependencies
# Stage 2: builder   — runs Next.js production build
# Stage 3: runtime   — minimal standalone image with non-root user
#
# Requires next.config.mjs: output: 'standalone'
# Secrets are NEVER baked into the image.
# Pass NEXT_PUBLIC_* vars at build time via --build-arg; sensitive vars at runtime.
# =============================================================================

# ── Stage 1: Dependency Installation ─────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy workspace manifests
COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY frontend/package.json ./frontend/

# Install all dependencies for the workspace
RUN npm ci --workspace=shared --workspace=frontend

# ── Stage 2: Builder ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules 2>/dev/null || true
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules 2>/dev/null || true

# Copy workspace manifests
COPY package.json package-lock.json ./
COPY shared/ ./shared/
COPY frontend/ ./frontend/

# Build shared types first
RUN npm run build --workspace=shared

# Build Next.js (standalone output — requires next.config.mjs output: 'standalone')
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build --workspace=frontend

# ── Stage 3: Runtime ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime

LABEL maintainer="top1-platform"
LABEL description="Top 1% Backend Roadmap Platform — Frontend"

# Security: run as non-root user
USER node

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy standalone Next.js output — includes only what's needed to run the app
COPY --chown=node:node --from=builder /app/frontend/.next/standalone ./
COPY --chown=node:node --from=builder /app/frontend/.next/static ./frontend/.next/static
COPY --chown=node:node --from=builder /app/frontend/public ./frontend/public

EXPOSE 3000

# Health check on Next.js root
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => process.exit(r.statusCode < 500 ? 0 : 1)).on('error', () => process.exit(1))"

# Next.js standalone server — handles SIGTERM gracefully
CMD ["node", "frontend/server.js"]
