import { Router } from "express";
import { authController } from "./auth.controller.js";
import { authGuard } from "../../middleware/authGuard.js";
import { authRateLimiter } from "../../middleware/rateLimiter.js";

const router = Router();

// Public Authentication Endpoints (Rate-limited to 5 req/min)
router.post("/register", authRateLimiter, (req, res, next) => authController.register(req, res, next));
router.post("/login", authRateLimiter, (req, res, next) => authController.login(req, res, next));
router.post("/refresh", authRateLimiter, (req, res, next) => authController.refresh(req, res, next));
router.post("/logout", (req, res, next) => authController.logout(req, res, next));

// Password Reset Flow
router.post("/forgot-password", authRateLimiter, (req, res, next) => authController.forgotPassword(req, res, next));
router.post("/reset-password", authRateLimiter, (req, res, next) => authController.resetPassword(req, res, next));

// Google OAuth
router.get("/google", (req, res) => authController.googleAuth(req, res));
router.get("/google/callback", (req, res, next) => authController.googleAuthCallback(req, res, next));

// Protected Identity Check
router.get("/me", authGuard, (req, res, next) => authController.getMe(req, res, next));

export const authRoutes = router;
