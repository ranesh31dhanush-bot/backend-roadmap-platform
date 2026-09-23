import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { SessionPayload } from "@top1/shared";
import { AppError } from "../../utils/appError.js";

export const ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60; // 15 minutes
export const REFRESH_TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days

export function signAccessToken(payload: SessionPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
  });
}

export function signRefreshToken(payload: SessionPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY_SECONDS,
  });
}

export function verifyAccessToken(token: string): SessionPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    return decoded as SessionPayload;
  } catch (err: unknown) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError("Access token expired", 401, "AUTHENTICATION_ERROR");
    }
    throw new AppError("Invalid access token", 401, "AUTHENTICATION_ERROR");
  }
}

export function verifyRefreshToken(token: string): SessionPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
    return decoded as SessionPayload;
  } catch (err: unknown) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError("Refresh token expired", 401, "AUTHENTICATION_ERROR");
    }
    throw new AppError("Invalid refresh token", 401, "AUTHENTICATION_ERROR");
  }
}
