import { Request, Response, NextFunction } from "express";
import { nanoid } from "nanoid";

declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const existingId = req.headers["x-request-id"] as string | undefined;
  const requestId = existingId && /^[a-zA-Z0-9_-]{8,64}$/.test(existingId) ? existingId : nanoid(16);

  req.id = requestId;
  res.setHeader("x-request-id", requestId);
  next();
}
