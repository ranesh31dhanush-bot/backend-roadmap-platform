import { Request, Response, NextFunction } from "express";
import { authService, AuthResult } from "./auth.service.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  googleAuthCallbackSchema,
} from "./auth.schema.js";
import { env } from "../../config/env.js";
import { ACCESS_TOKEN_EXPIRY_SECONDS, REFRESH_TOKEN_EXPIRY_SECONDS } from "./jwt.service.js";
import { ApiSuccessResponse } from "@top1/shared";
import { AppError } from "../../utils/appError.js";
import { logger } from "../../utils/logger.js";

const isProduction = env.NODE_ENV === "production";

function setAuthCookies(res: Response, result: AuthResult): void {
  // Access Token Cookie (15m)
  res.cookie("accessToken", result.accessToken, {
    httpOnly: true,
    secure: isProduction || env.COOKIE_SECURE,
    sameSite: "lax",
    maxAge: ACCESS_TOKEN_EXPIRY_SECONDS * 1000,
    path: "/",
  });

  // Refresh Token Cookie (7d)
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: isProduction || env.COOKIE_SECURE,
    sameSite: "lax",
    maxAge: REFRESH_TOKEN_EXPIRY_SECONDS * 1000,
    path: "/",
  });

  // CSRF Token Cookie (Readable by JS to place in x-csrf-token header)
  res.cookie("csrfToken", result.csrfToken, {
    httpOnly: false,
    secure: isProduction || env.COOKIE_SECURE,
    sameSite: "lax",
    maxAge: REFRESH_TOKEN_EXPIRY_SECONDS * 1000,
    path: "/",
  });
}

function clearAuthCookies(res: Response): void {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/" });
  res.clearCookie("csrfToken", { path: "/" });
}

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = registerSchema.parse(req.body);
      const meta = {
        ip: req.ip || "unknown",
        userAgent: req.headers["user-agent"] || "unknown",
      };

      const result = await authService.register(input, meta);
      setAuthCookies(res, result);

      const response: ApiSuccessResponse<{ user: typeof result.user; csrfToken: string }> = {
        success: true,
        data: {
          user: result.user,
          csrfToken: result.csrfToken,
        },
        meta: {
          requestId: req.id,
          timestamp: new Date().toISOString(),
        },
      };

      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = loginSchema.parse(req.body);
      const meta = {
        ip: req.ip || "unknown",
        userAgent: req.headers["user-agent"] || "unknown",
      };

      const result = await authService.login(input, meta);
      setAuthCookies(res, result);

      const response: ApiSuccessResponse<{ user: typeof result.user; csrfToken: string }> = {
        success: true,
        data: {
          user: result.user,
          csrfToken: result.csrfToken,
        },
        meta: {
          requestId: req.id,
          timestamp: new Date().toISOString(),
        },
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      const meta = {
        ip: req.ip || "unknown",
        userAgent: req.headers["user-agent"] || "unknown",
      };

      const result = await authService.refreshTokens(rawRefreshToken, meta);
      setAuthCookies(res, result);

      const response: ApiSuccessResponse<{ user: typeof result.user; csrfToken: string }> = {
        success: true,
        data: {
          user: result.user,
          csrfToken: result.csrfToken,
        },
        meta: {
          requestId: req.id,
          timestamp: new Date().toISOString(),
        },
      };

      res.status(200).json(response);
    } catch (err) {
      clearAuthCookies(res);
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawRefreshToken = req.cookies?.refreshToken;
      await authService.logout(rawRefreshToken);
      clearAuthCookies(res);

      const response: ApiSuccessResponse<{ message: string }> = {
        success: true,
        data: { message: "Logged out successfully" },
        meta: {
          requestId: req.id,
          timestamp: new Date().toISOString(),
        },
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw AppError.unauthorized();
      }

      const user = await authService.getMe(req.user.userId);

      const response: ApiSuccessResponse<{ user: typeof user }> = {
        success: true,
        data: { user },
        meta: {
          requestId: req.id,
          timestamp: new Date().toISOString(),
        },
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = forgotPasswordSchema.parse(req.body);
      const result = await authService.requestPasswordReset(input.email);

      const response: ApiSuccessResponse<{ message: string; resetToken?: string }> = {
        success: true,
        data: {
          message: "If the email is registered, a password reset link has been dispatched.",
          // Only return resetToken in development/test for automated testing convenience
          resetToken: env.NODE_ENV !== "production" ? result.resetToken : undefined,
        },
        meta: {
          requestId: req.id,
          timestamp: new Date().toISOString(),
        },
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = resetPasswordSchema.parse(req.body);
      await authService.resetPassword(input);
      clearAuthCookies(res);

      const response: ApiSuccessResponse<{ message: string }> = {
        success: true,
        data: { message: "Password has been successfully reset. Please log in with your new password." },
        meta: {
          requestId: req.id,
          timestamp: new Date().toISOString(),
        },
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  // Google OAuth initiation
  googleAuth(req: Request, res: Response): void {
    const state = req.query.state as string || "default_state";
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      process.env.GOOGLE_CLIENT_ID || "mock_google_client_id",
    )}&redirect_uri=${encodeURIComponent(
      process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/v1/auth/google/callback",
    )}&response_type=code&scope=openid%20email%20profile&state=${encodeURIComponent(state)}`;

    res.redirect(googleAuthUrl);
  }

  // Google OAuth callback
  async googleAuthCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = googleAuthCallbackSchema.parse(req.query);

      let googleProfile: {
        googleId: string;
        email: string;
        displayName: string;
        avatarUrl?: string;
      };

      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const callbackUrl =
        process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/v1/auth/google/callback";

      const isRealOAuth =
        clientId &&
        clientSecret &&
        !clientId.startsWith("mock_") &&
        !req.query.mockEmail;

      if (isRealOAuth) {
        // Exchange authorization code for tokens
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: callbackUrl,
            grant_type: "authorization_code",
          }),
        });

        if (!tokenRes.ok) {
          const errBody = await tokenRes.text();
          logger.error({ status: tokenRes.status, errBody }, "Google OAuth token exchange failed");
          throw AppError.badRequest("Failed to exchange authorization code with Google");
        }

        const tokenData = (await tokenRes.json()) as {
          access_token: string;
          id_token: string;
          token_type: string;
        };

        // Fetch user profile from Google UserInfo endpoint
        const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        });

        if (!userInfoRes.ok) {
          const errBody = await userInfoRes.text();
          logger.error({ status: userInfoRes.status, errBody }, "Google OAuth userinfo fetch failed");
          throw AppError.badRequest("Failed to retrieve Google user profile");
        }

        const userInfo = (await userInfoRes.json()) as {
          sub: string;
          email: string;
          name?: string;
          picture?: string;
          given_name?: string;
          family_name?: string;
        };

        googleProfile = {
          googleId: userInfo.sub,
          email: userInfo.email,
          displayName: userInfo.name || userInfo.email.split("@")[0] || "Learner",
          avatarUrl: userInfo.picture,
        };
      } else {
        // Mock fallback for unit tests and local mock mode
        googleProfile = {
          googleId: (req.query.mockGoogleId as string) || `google_${code}`,
          email: (req.query.mockEmail as string) || `learner_${code}@example.com`,
          displayName: "Google Learner",
          avatarUrl: "https://lh3.googleusercontent.com/a/default",
        };
      }

      const meta = {
        ip: req.ip || "unknown",
        userAgent: req.headers["user-agent"] || "unknown",
      };

      const result = await authService.handleGoogleUser(googleProfile, meta);
      setAuthCookies(res, result);

      // Redirect to frontend dashboard or onboarding
      const redirectTarget = result.user.isOnboarded ? "/dashboard" : "/onboarding";
      const frontendBase = env.FRONTEND_URL.replace(/\/+$/, "");
      res.redirect(`${frontendBase}${redirectTarget}`);
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
