# Deployment & Infrastructure Architecture Specification

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 4 — System Architecture  
**Author:** Winston (BMAD System Architect)  
**Date:** September 21, 2026  
**Status:** Completed Architecture  

---

## 1. Production Deployment Topology

```
                       PRODUCTION DEPLOYMENT ARCHITECTURE
 
    [Internet Traffic]
           │
           ▼
    [Cloudflare CDN / Edge WAF] ── (SSL Termination, DDoS Mitigation, Static Asset Cache)
           │
           ├──► HTTPS / (Next.js SSR & Static Pages) ──► [Frontend Container Cluster]
           │                                                    │
           └──► HTTPS /api/v1/* ────────────────────────► [Backend Express API Cluster]
                                                                │
                                                ┌───────────────┴───────────────┐
                                                │                               │
                                                ▼                               ▼
                                    ┌───────────────────────┐       ┌───────────────────────┐
                                    │ Managed MongoDB Atlas │       │ Managed Redis (V1)    │
                                    │ (Primary + 2 Replicas)│       │ (Cache & Queue Store) │
                                    └───────────────────────┘       └───────────────────────┘
```

---

## 2. Docker Container Architecture

Multi-stage Docker builds ensure minimal image sizes and hardened production security:

### 2.1 Backend Container Architecture (`backend.Dockerfile`):
```dockerfile
# Stage 1: Build Stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm ci
COPY src/ ./src/
RUN npm run build

# Stage 2: Production Runtime Stage
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 appuser
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
USER appuser
EXPOSE 4000
CMD ["node", "dist/server.js"]
```

### 2.2 Local Development `docker-compose.yml` Stack:
- `frontend`: Next.js running in development mode on port `3000`.
- `backend`: Express API with `nodemon` / `tsx` watch on port `4000`.
- `mongodb`: MongoDB 7.0 initialized with single-node replica set on port `27017` (required for multi-document ACID transactions).
- `redis`: Redis Alpine on port `6379`.

---

## 3. Graceful Shutdown & Reliability Protocols

To ensure zero dropped requests during deployments:

```typescript
async function gracefulShutdown(signal: string) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  // 1. Stop accepting new HTTP connections
  httpServer.close(async () => {
    logger.info('HTTP server closed.');
    
    // 2. Close database connection pool
    await mongoose.connection.close(false);
    logger.info('MongoDB connections closed.');
    
    process.exit(0);
  });

  // Force exit if connections fail to drain within 10 seconds
  setTimeout(() => {
    logger.error('Graceful shutdown timeout exceeded. Forcing exit.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
```
