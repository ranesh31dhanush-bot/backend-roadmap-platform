import { Router } from "express";
import { projectsController } from "./projects.controller.js";

const router = Router();

// PROJ-001: Capstone project specs — public, no auth needed
router.get("/", projectsController.listProjects.bind(projectsController));

export const projectsRouter = router;
