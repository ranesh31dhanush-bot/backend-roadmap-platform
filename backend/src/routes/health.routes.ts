import { Router, Request, Response } from "express";
import { checkDatabaseHealth } from "../config/database.js";
import { env } from "../config/env.js";
import { HealthCheckResponse } from "@top1/shared";

const router = Router();

// Primary health & liveness probe (supports GET /health and GET /health/live)
router.get(["/", "/live"], (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Readiness probe
router.get("/ready", async (_req: Request, res: Response) => {
  const dbHealth = await checkDatabaseHealth();
  const isReady = dbHealth.status === "connected";

  const response: HealthCheckResponse = {
    status: isReady ? "ok" : "degraded",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: env.NODE_ENV,
    services: {
      database: dbHealth,
    },
  };

  res.status(isReady ? 200 : 503).json(response);
});

export const healthRoutes = router;
