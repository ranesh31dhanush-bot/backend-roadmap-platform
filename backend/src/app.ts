import express, { Express } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { requestIdMiddleware } from "./middleware/requestId.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { csrfGuard } from "./middleware/csrfGuard.js";
import { healthRoutes } from "./routes/health.routes.js";
import { apiV1Routes } from "./routes/api.v1.routes.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { curriculumRouter } from "./modules/curriculum/curriculum.routes.js";
import { onboardingRouter } from "./modules/onboarding/onboarding.routes.js";
import { scheduleRouter } from "./modules/schedule/schedule.routes.js";
import { progressRouter } from "./modules/progress/progress.routes.js";
import { quizRouter } from "./modules/quizzes/quiz.routes.js";
import { notesRouter } from "./modules/notes/notes.routes.js";
import { linksRouter } from "./modules/links/links.routes.js";
import { streaksRouter } from "./modules/streaks/streaks.routes.js";
import { migrationRouter } from "./modules/migration/migration.routes.js";
import { adminRouter } from "./modules/admin/admin.routes.js";
import { projectsRouter } from "./modules/projects/projects.routes.js";
import { analyticsRouter } from "./modules/analytics/analytics.routes.js";

export function createApp(): Express {
  const app = express();

  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: env.NODE_ENV === "production" ? undefined : false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  // CORS Configuration
  app.use(
    cors({
      origin: [env.FRONTEND_URL],
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "x-request-id", "x-csrf-token"],
    }),
  );

  // Parsers & Context
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(cookieParser(env.COOKIE_SECRET));

  // Request ID & Logging
  app.use(requestIdMiddleware);
  if (env.NODE_ENV !== "test") {
    app.use(requestLogger);
  }

  // CSRF Protection on mutating endpoints
  app.use(csrfGuard);

  // Root probe for keep-alive pingers (UptimeRobot, cron-job.org, PaaS root probes)
  app.get("/", (_req, res) => {
    res.status(200).json({ status: "ok", message: "Top 1% Backend Roadmap API is live", timestamp: new Date().toISOString() });
  });

  // Health Probes (no /api/v1 prefix for standard k8s/paas monitoring)
  app.use("/health", healthRoutes);

  // API v1 Routes
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/curriculum", curriculumRouter);
  app.use("/api/v1/onboarding", onboardingRouter);
  app.use("/api/v1/schedule", scheduleRouter);
  app.use("/api/v1/progress", progressRouter);
  app.use("/api/v1/quizzes", quizRouter);
  app.use("/api/v1/notes", notesRouter);
  app.use("/api/v1/links", linksRouter);
  app.use("/api/v1/streaks", streaksRouter);
  app.use("/api/v1/migration", migrationRouter);
  app.use("/api/v1/admin", adminRouter);
  app.use("/api/v1/projects", projectsRouter);
  app.use("/api/v1/analytics", analyticsRouter);
  app.use("/api/v1", apiV1Routes);

  // 404 & Centralized Error Handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
