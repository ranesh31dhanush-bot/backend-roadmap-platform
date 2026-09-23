import { Router } from "express";
import { MigrationController } from "./migration.controller.js";
import { authGuard } from "../../middleware/authGuard.js";
import { csrfGuard } from "../../middleware/csrfGuard.js";

const router = Router();

// All migration endpoints require authentication
router.use(authGuard);

router.get("/status", MigrationController.getMigrationStatus);
router.post("/import", csrfGuard, MigrationController.importLegacyData);

export { router as migrationRouter };
