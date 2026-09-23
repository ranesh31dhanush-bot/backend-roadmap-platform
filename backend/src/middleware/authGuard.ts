import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../modules/auth/jwt.service.js";
import { SessionPayload } from "@top1/shared";
import { AppError } from "../utils/appError.js";

declare global {
  namespace Express {
    interface Request {
      user?: SessionPayload;
    }
  }
}

export function authGuard(req: Request, _res: Response, next: NextFunction): void {
  const tokenFromCookie = req.cookies?.accessToken;
  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

  const token = tokenFromCookie || tokenFromHeader;

  if (!token) {
    return next(AppError.unauthorized("Authentication required"));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    next(err);
  }
}

export function optionalAuthGuard(req: Request, _res: Response, next: NextFunction): void {
  const tokenFromCookie = req.cookies?.accessToken;
  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

  const token = tokenFromCookie || tokenFromHeader;

  if (token) {
    try {
      const payload = verifyAccessToken(token);
      req.user = payload;
    } catch {
      // Ignore errors for optional auth
    }
  }
  next();
}
