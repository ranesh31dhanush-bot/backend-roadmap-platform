import { Router } from "express";
import { curriculumController } from "./curriculum.controller.js";

const router = Router();

// Public curriculum read APIs
router.get("/", (req, res, next) => curriculumController.getOverview(req, res, next));
router.get("/tree", (req, res, next) => curriculumController.getTree(req, res, next));
router.get("/phases", (req, res, next) => curriculumController.getPhases(req, res, next));
router.get("/nodes/:canonicalId", (req, res, next) => curriculumController.getNodeByCanonicalId(req, res, next));

export const curriculumRouter = router;
