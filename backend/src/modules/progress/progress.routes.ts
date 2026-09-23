import { Router } from "express";
import { progressController } from "./progress.controller.js";
import { authGuard } from "../../middleware/authGuard.js";

const router = Router();

// All progress endpoints require authentication
router.use(authGuard);

router.post("/toggle", (req, res, next) => progressController.toggle(req, res, next));
router.get("/summary", (req, res, next) => progressController.getSummary(req, res, next));
router.get("/day/:dayId", (req, res, next) => progressController.getDayProgress(req, res, next));

export const progressRouter = router;
