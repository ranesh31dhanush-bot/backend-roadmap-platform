import { Router, Request, Response } from "express";
import { ApiSuccessResponse } from "@top1/shared";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  const response: ApiSuccessResponse<{
    message: string;
    version: string;
    docs: string;
    modules: string[];
  }> = {
    success: true,
    data: {
      message: "Top 1% Backend Roadmap Platform API v1",
      version: "1.0.0",
      docs: "/api/v1/docs",
      modules: [
        "auth",
        "users",
        "onboarding",
        "curriculum",
        "schedule",
        "progress",
        "quizzes",
        "notes",
        "links",
        "streaks",
        "projects",
        "analytics",
        "migration",
        "admin",
      ],
    },
    meta: {
      requestId: req.id,
      timestamp: new Date().toISOString(),
    },
  };

  res.status(200).json(response);
});

export const apiV1Routes = router;
