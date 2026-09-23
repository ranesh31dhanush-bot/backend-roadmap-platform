# =============================================================================
# Backend — Multi-Stage Production Dockerfile
# HARD-001: Sprint 11 Production Hardening
# =============================================================================
#
# Stage 1: builder — compiles TypeScript to dist/
# Stage 2: runtime — minimal production image with non-root user
#
# Secrets are NEVER baked into the image.
# All secrets are injected at runtime via environment variables.
# =============================================================================

# ── Stage 1: Builder ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

LABEL stage="builder"

WORKDIR /app

# Copy workspace manifests first to leverage Docker layer caching
COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/

# Install ALL dependencies (dev + prod) needed for TypeScript compilation
RUN npm ci --workspace=shared --workspace=backend --include=dev

# Copy shared source and build it
COPY shared/ ./shared/
RUN npm run build --workspace=shared

# Copy backend source and compile TypeScript
COPY backend/ ./backend/
RUN npm run build --workspace=backend

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime

LABEL maintainer="top1-platform"
LABEL description="Top 1% Backend Roadmap Platform — Backend API"

# Security: run as non-root user
# node user (uid 1000) is pre-created in node:alpine images
USER node

WORKDIR /app

# Copy workspace manifests for production install
COPY --chown=node:node package.json package-lock.json ./
COPY --chown=node:node shared/package.json ./shared/
COPY --chown=node:node backend/package.json ./backend/

# Install ONLY production dependencies (no devDependencies)
RUN npm ci --workspace=shared --workspace=backend --omit=dev

# Copy compiled shared types
COPY --chown=node:node --from=builder /app/shared/dist ./shared/dist

# Copy compiled backend dist
COPY --chown=node:node --from=builder /app/backend/dist ./backend/dist

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Expose API port
EXPOSE 5000

# Health check — uses the liveness probe endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health/live', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Start the compiled server
# Node receives SIGTERM from Docker and handles graceful shutdown (see server.ts)
CMD ["node", "backend/dist/server.js"]
