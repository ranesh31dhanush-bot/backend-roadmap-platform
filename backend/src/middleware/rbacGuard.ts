import { Request, Response, NextFunction } from "express";
import { UserRole } from "@top1/shared";
import { AppError } from "../utils/appError.js";

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized("Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(AppError.forbidden("You do not have permission to access this resource"));
    }

    next();
  };
}
