import { Router } from "express";
import { quizController } from "./quiz.controller.js";
import { authGuard } from "../../middleware/authGuard.js";

const router = Router();

// All quiz endpoints require authentication
router.use(authGuard);

router.get("/banks", (req, res, next) => quizController.getBanks(req, res, next));
router.get("/canonical/:canonicalId", (req, res, next) =>
  quizController.getByCanonicalId(req, res, next),
);
router.post("/:quizBankId/start", (req, res, next) => quizController.start(req, res, next));
router.post("/:quizBankId/submit", (req, res, next) => quizController.submit(req, res, next));
router.get("/attempts/:attemptId", (req, res, next) => quizController.getAttempt(req, res, next));
router.get("/high-scores", (req, res, next) => quizController.getHighScores(req, res, next));

export const quizRouter = router;
