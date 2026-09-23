import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError.js";

interface RateLimitRecord {
  timestamps: number[];
}

export function createRateLimiter(options: { windowMs: number; maxRequests: number; message?: string }) {
  const ipStore = new Map<string, RateLimitRecord>();

  // Cleanup old entries every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipStore.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < options.windowMs);
      if (record.timestamps.length === 0) {
        ipStore.delete(ip);
      }
    }
  }, 5 * 60 * 1000).unref();

  return (req: Request, res: Response, next: NextFunction): void => {
    if (process.env.NODE_ENV === "test" && req.headers["x-skip-rate-limit"]) {
      return next();
    }

    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();

    const record = ipStore.get(ip) || { timestamps: [] };
    // Filter timestamps within window
    record.timestamps = record.timestamps.filter((ts) => now - ts < options.windowMs);

    if (record.timestamps.length >= options.maxRequests) {
      res.setHeader("Retry-After", Math.ceil(options.windowMs / 1000));
      return next(AppError.rateLimit(options.message || "Too many requests. Please try again later."));
    }

    record.timestamps.push(now);
    ipStore.set(ip, record);

    res.setHeader("X-RateLimit-Limit", options.maxRequests);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, options.maxRequests - record.timestamps.length));

    next();
  };
}

// 5 requests per minute per IP for sensitive auth operations
export const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 5,
  message: "Too many authentication attempts. Please wait a minute.",
});
