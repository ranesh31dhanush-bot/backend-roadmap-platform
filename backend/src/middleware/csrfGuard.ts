import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// Routes that initialize or refresh session and do not require pre-existing CSRF tokens
const EXEMPT_ROUTES = new Set([
  "/api/v1/auth/register",
  "/api/v1/auth/login",
  "/api/v1/auth/refresh",
  "/api/v1/auth/logout",
  "/api/v1/auth/forgot-password",
  "/api/v1/auth/reset-password",
  "/api/v1/auth/google",
  "/api/v1/auth/google/callback",
]);

export function csrfGuard(req: Request, _res: Response, next: NextFunction): void {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  // Exempt public auth initialization endpoints
  if (EXEMPT_ROUTES.has(req.path) || EXEMPT_ROUTES.has(req.originalUrl.split("?")[0] || "")) {
    return next();
  }

  const headerCsrf = req.headers["x-csrf-token"] as string | undefined;
  const cookieCsrf = req.cookies?.csrfToken;

  if (!headerCsrf || !cookieCsrf || headerCsrf !== cookieCsrf) {
    return next(AppError.forbidden("Invalid or missing CSRF token"));
  }

  next();
}
