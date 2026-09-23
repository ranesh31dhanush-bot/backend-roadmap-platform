import { Router } from "express";
import { scheduleController } from "./schedule.controller.js";
import { authGuard } from "../../middleware/authGuard.js";

const router = Router();

// All schedule endpoints require authentication
router.use(authGuard);

router.get("/me", (req, res, next) => scheduleController.getMySchedule(req, res, next));
router.get("/roadmap", (req, res, next) => scheduleController.getRoadmap(req, res, next));
router.post("/reschedule", (req, res, next) => scheduleController.reschedule(req, res, next));
router.post("/pause", (req, res, next) => scheduleController.pause(req, res, next));
router.post("/resume", (req, res, next) => scheduleController.resume(req, res, next));

export const scheduleRouter = router;
