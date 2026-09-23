import { Router } from "express";
import { linksController } from "./links.controller.js";
import { authGuard } from "../../middleware/authGuard.js";

const router = Router();

// All links endpoints require authentication
router.use(authGuard);

router.post("/", (req, res, next) => linksController.createLink(req, res, next));
router.delete("/:id", (req, res, next) => linksController.deleteLink(req, res, next));

router.get("/:dayId", (req, res, next) => linksController.getLinks(req, res, next));
router.get("/day/:dayId", (req, res, next) => linksController.getLinks(req, res, next));

export const linksRouter = router;
