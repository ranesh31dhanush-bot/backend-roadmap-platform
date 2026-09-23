import { Router } from "express";
import { analyticsController } from "./analytics.controller.js";
import { authGuard } from "../../middleware/authGuard.js";

const router = Router();

// All analytics endpoints require authentication
router.use(authGuard);

// ANLT-001: Fire-and-forget telemetry event ingestion
router.post("/event", (req, res, next) => analyticsController.ingestEvent(req, res, next));

// ANLT-002: Personal velocity stats for dashboard widget
router.get("/velocity", (req, res, next) => analyticsController.getVelocityStats(req, res, next));

export const analyticsRouter = router;
