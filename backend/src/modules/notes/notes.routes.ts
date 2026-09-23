import { Router } from "express";
import { notesController } from "./notes.controller.js";
import { authGuard } from "../../middleware/authGuard.js";

const router = Router();

// All notes endpoints require authentication
router.use(authGuard);

// List/Search notes
router.get("/", (req, res, next) => notesController.listNotes(req, res, next));

// Direct /:dayId routes
router.get("/:dayId", (req, res, next) => notesController.getNote(req, res, next));
router.put("/:dayId", (req, res, next) => notesController.saveNote(req, res, next));

// Alias /day/:dayId routes for specification compatibility
router.get("/day/:dayId", (req, res, next) => notesController.getNote(req, res, next));
router.put("/day/:dayId", (req, res, next) => notesController.saveNote(req, res, next));

export const notesRouter = router;
