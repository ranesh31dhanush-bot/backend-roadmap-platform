import { Router } from "express";
import { AdminController } from "./admin.controller.js";
import { authGuard } from "../../middleware/authGuard.js";
import { requireRole } from "../../middleware/rbacGuard.js";

const router = Router();

// All admin endpoints require authentication and 'admin' role
router.use(authGuard);
router.use(requireRole("admin"));

// Dashboard Overview
router.get("/dashboard", AdminController.getDashboard);

// Curriculum Node Management
router.get("/curriculum/nodes", AdminController.getCurriculumNodes);
router.get("/curriculum/nodes/:id", AdminController.getCurriculumNodeById);
router.put("/curriculum/nodes/:id", AdminController.updateCurriculumNode);
router.post("/curriculum/nodes", AdminController.createCurriculumNode);

// Curriculum Version Management & Semantic Publishing
router.get("/curriculum/versions", AdminController.getVersions);
router.post("/curriculum/versions/draft", AdminController.createDraftVersion);
router.post("/curriculum/versions/publish", AdminController.publishVersion);

// Quiz Bank & Question Management
router.get("/quizzes/banks", AdminController.getQuizBanks);
router.get("/quizzes/banks/:bankId/questions", AdminController.getQuizQuestions);
router.post("/quizzes/banks/:bankId/questions", AdminController.createQuizQuestion);
router.get("/quizzes/questions/:id", AdminController.getQuizQuestionById);
router.put("/quizzes/questions/:id", AdminController.updateQuizQuestion);
router.delete("/quizzes/questions/:id", AdminController.deleteQuizQuestion);

// Audit Logs
router.get("/audit-logs", AdminController.getAuditLogs);

export const adminRouter = router;
