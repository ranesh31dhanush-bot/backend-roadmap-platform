import { Router } from "express";
import { streaksController } from "./streaks.controller.js";
import { authGuard } from "../../middleware/authGuard.js";

const router = Router();

// All streaks endpoints require authentication
router.use(authGuard);

router.get("/", (req, res, next) => streaksController.getStreak(req, res, next));
router.get("/me", (req, res, next) => streaksController.getStreak(req, res, next));
router.post("/activity", (req, res, next) => streaksController.recordActivity(req, res, next));
router.post("/freeze", (req, res, next) => streaksController.consumeFreeze(req, res, next));

export const streaksRouter = router;
