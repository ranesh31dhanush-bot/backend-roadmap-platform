import { Router } from "express";
import { onboardingController } from "./onboarding.controller.js";
import { authGuard } from "../../middleware/authGuard.js";

const router = Router();

// All onboarding endpoints require authentication
router.use(authGuard);

router.post("/start", (req, res, next) => onboardingController.start(req, res, next));
router.get("/status", (req, res, next) => onboardingController.getStatus(req, res, next));

export const onboardingRouter = router;
