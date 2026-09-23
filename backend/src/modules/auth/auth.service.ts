import mongoose from "mongoose";
import { nanoid } from "nanoid";
import { UserModel, IUser } from "../../models/user.model.js";
import { UserCredentialsModel } from "../../models/userCredentials.model.js";
import { UserSessionModel } from "../../models/userSession.model.js";
import { PasswordResetModel } from "../../models/passwordReset.model.js";
import { hashPassword, verifyPassword, hashToken, generateSecureToken, generateCsrfToken } from "./crypto.utils.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken, REFRESH_TOKEN_EXPIRY_SECONDS } from "./jwt.service.js";
import { AppError } from "../../utils/appError.js";
import { logger } from "../../utils/logger.js";
import { UserDTO, SessionPayload } from "@top1/shared";
import { RegisterInput, LoginInput, ResetPasswordInput } from "./auth.schema.js";

export interface AuthResult {
  user: UserDTO;
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
}

export class AuthService {
  /**
   * Transforms a Mongoose user document into a safe UserDTO
   */
  private toUserDTO(user: IUser): UserDTO {
    return {
      id: user._id.toString(),
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      role: user.role,
      isOnboarded: user.isOnboarded,
      activeCurriculumVersion: user.activeCurriculumVersion,
      badges: user.badges || [],
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  /**
   * Register a new user with email & password
   */
  async register(input: RegisterInput, meta: { ip: string; userAgent: string }): Promise<AuthResult> {
    const existingUser = await UserModel.findOne({ email: input.email });
    if (existingUser) {
      throw AppError.conflict("An account with this email address already exists");
    }

    const passwordHash = await hashPassword(input.password);
    const userId = new mongoose.Types.ObjectId();

    // Create User
    const user = await UserModel.create({
      _id: userId,
      email: input.email,
      displayName: input.displayName,
      role: "learner",
      isOnboarded: false,
      activeCurriculumVersion: "1.0.0",
      badges: [],
    });

    // Create User Credentials
    await UserCredentialsModel.create({
      userId,
      passwordHash,
    });

    // Create Session
    const familyId = nanoid(24);
    const sessionId = nanoid(24);
    const sessionPayload: SessionPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      sessionId,
    };

    const accessToken = signAccessToken(sessionPayload);
    const refreshToken = signRefreshToken(sessionPayload);
    const refreshTokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_SECONDS * 1000);

    await UserSessionModel.create({
      userId,
      refreshTokenHash,
      familyId,
      isRevoked: false,
      userAgent: meta.userAgent,
      ip: meta.ip,
      expiresAt,
    });

    const csrfToken = generateCsrfToken();

    logger.info({ userId: user._id.toString(), email: user.email }, "User registered successfully");

    return {
      user: this.toUserDTO(user),
      accessToken,
      refreshToken,
      csrfToken,
    };
  }

  /**
   * Login with email and password
   */
  async login(input: LoginInput, meta: { ip: string; userAgent: string }): Promise<AuthResult> {
    const user = await UserModel.findOne({ email: input.email });
    if (!user) {
      throw AppError.unauthorized("Invalid email or password");
    }

    const credentials = await UserCredentialsModel.findOne({ userId: user._id });
    if (!credentials) {
      throw AppError.unauthorized("Invalid email or password");
    }

    const isValid = await verifyPassword(input.password, credentials.passwordHash);
    if (!isValid) {
      logger.warn({ email: input.email, ip: meta.ip }, "Failed login attempt");
      throw AppError.unauthorized("Invalid email or password");
    }

    // Create Session
    const familyId = nanoid(24);
    const sessionId = nanoid(24);
    const sessionPayload: SessionPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      sessionId,
    };

    const accessToken = signAccessToken(sessionPayload);
    const refreshToken = signRefreshToken(sessionPayload);
    const refreshTokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_SECONDS * 1000);

    await UserSessionModel.create({
      userId: user._id,
      refreshTokenHash,
      familyId,
      isRevoked: false,
      userAgent: meta.userAgent,
      ip: meta.ip,
      expiresAt,
    });

    const csrfToken = generateCsrfToken();

    logger.info({ userId: user._id.toString() }, "User logged in successfully");

    return {
      user: this.toUserDTO(user),
      accessToken,
      refreshToken,
      csrfToken,
    };
  }

  /**
   * Refresh access token with Refresh Token Family Rotation & Reuse Detection
   */
  async refreshTokens(rawRefreshToken: string, meta: { ip: string; userAgent: string }): Promise<AuthResult> {
    if (!rawRefreshToken) {
      throw AppError.unauthorized("Refresh token is required");
    }

    // 1. Verify JWT signature
    const payload = verifyRefreshToken(rawRefreshToken);
    const tokenHash = hashToken(rawRefreshToken);

    // 2. Find matching session in DB
    const session = await UserSessionModel.findOne({ refreshTokenHash: tokenHash });

    // REUSE DETECTION: If token was already revoked or missing but valid JWT
    if (!session || session.isRevoked) {
      if (session) {
        // Revoke entire family because an old token was reused!
        logger.warn(
          { userId: session.userId.toString(), familyId: session.familyId, ip: meta.ip },
          "⚠️ SECURITY ALERT: Refresh token reuse detected. Revoking entire session family.",
        );
        await UserSessionModel.updateMany({ familyId: session.familyId }, { isRevoked: true });
      }
      throw AppError.unauthorized("Session revoked. Please log in again.");
    }

    // 3. Mark old session as revoked
    session.isRevoked = true;
    await session.save();

    // 4. Find user
    const user = await UserModel.findById(session.userId);
    if (!user) {
      throw AppError.unauthorized("User not found");
    }

    // 5. Issue new Token Pair in same Family
    const newSessionId = nanoid(24);
    const sessionPayload: SessionPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      sessionId: newSessionId,
    };

    const newAccessToken = signAccessToken(sessionPayload);
    const newRefreshToken = signRefreshToken(sessionPayload);
    const newRefreshTokenHash = hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_SECONDS * 1000);

    await UserSessionModel.create({
      userId: user._id,
      refreshTokenHash: newRefreshTokenHash,
      familyId: session.familyId, // keep same family
      isRevoked: false,
      userAgent: meta.userAgent,
      ip: meta.ip,
      expiresAt,
    });

    const csrfToken = generateCsrfToken();

    return {
      user: this.toUserDTO(user),
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      csrfToken,
    };
  }

  /**
   * Logout user by revoking session
   */
  async logout(rawRefreshToken?: string): Promise<void> {
    if (rawRefreshToken) {
      try {
        const tokenHash = hashToken(rawRefreshToken);
        await UserSessionModel.updateOne({ refreshTokenHash: tokenHash }, { isRevoked: true });
      } catch (err) {
        logger.warn({ err }, "Error during session invalidation on logout");
      }
    }
  }

  /**
   * Get current authenticated user profile
   */
  async getMe(userId: string): Promise<UserDTO> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw AppError.notFound("User not found");
    }
    return this.toUserDTO(user);
  }

  /**
   * Request password reset token via email
   */
  async requestPasswordReset(email: string): Promise<{ resetToken?: string }> {
    const user = await UserModel.findOne({ email });
    if (!user) {
      // Return success representation without leaking existence of email
      return {};
    }

    const rawToken = generateSecureToken(32);
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await PasswordResetModel.create({
      userId: user._id,
      tokenHash,
      expiresAt,
      isUsed: false,
    });

    logger.info({ userId: user._id.toString(), email: user.email }, "Password reset requested");

    return { resetToken: rawToken };
  }

  /**
   * Reset password using token
   */
  async resetPassword(input: ResetPasswordInput): Promise<void> {
    const tokenHash = hashToken(input.token);

    const resetRecord = await PasswordResetModel.findOne({
      tokenHash,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!resetRecord) {
      throw AppError.badRequest("Invalid or expired password reset token");
    }

    // 1. Hash new password
    const newHash = await hashPassword(input.newPassword);

    // 2. Update credentials
    await UserCredentialsModel.updateOne(
      { userId: resetRecord.userId },
      { passwordHash: newHash },
      { upsert: true },
    );

    // 3. Mark token used
    resetRecord.isUsed = true;
    await resetRecord.save();

    // 4. Revoke all active sessions for this user (security requirement)
    await UserSessionModel.updateMany({ userId: resetRecord.userId }, { isRevoked: true });

    logger.info({ userId: resetRecord.userId.toString() }, "Password reset completed successfully");
  }

  /**
   * Google OAuth user resolve or link
   */
  async handleGoogleUser(googleProfile: {
    googleId: string;
    email: string;
    displayName: string;
    avatarUrl?: string;
  }, meta: { ip: string; userAgent: string }): Promise<AuthResult> {
    let user = await UserModel.findOne({ googleId: googleProfile.googleId });

    if (!user) {
      // Check if user with same email exists -> Link account
      user = await UserModel.findOne({ email: googleProfile.email.toLowerCase() });

      if (user) {
        user.googleId = googleProfile.googleId;
        if (!user.avatarUrl && googleProfile.avatarUrl) {
          user.avatarUrl = googleProfile.avatarUrl;
        }
        await user.save();
        logger.info({ userId: user._id.toString() }, "Linked Google account to existing user");
      } else {
        // Create new user
        const userId = new mongoose.Types.ObjectId();
        user = await UserModel.create({
          _id: userId,
          email: googleProfile.email.toLowerCase(),
          displayName: googleProfile.displayName,
          avatarUrl: googleProfile.avatarUrl,
          googleId: googleProfile.googleId,
          role: "learner",
          isOnboarded: false,
          activeCurriculumVersion: "1.0.0",
          badges: [],
        });
        logger.info({ userId: user._id.toString() }, "Created new user via Google OAuth");
      }
    }

    // Create session
    const familyId = nanoid(24);
    const sessionId = nanoid(24);
    const sessionPayload: SessionPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      sessionId,
    };

    const accessToken = signAccessToken(sessionPayload);
    const refreshToken = signRefreshToken(sessionPayload);
    const refreshTokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_SECONDS * 1000);

    await UserSessionModel.create({
      userId: user._id,
      refreshTokenHash,
      familyId,
      isRevoked: false,
      userAgent: meta.userAgent,
      ip: meta.ip,
      expiresAt,
    });

    const csrfToken = generateCsrfToken();

    return {
      user: this.toUserDTO(user),
      accessToken,
      refreshToken,
      csrfToken,
    };
  }
}

export const authService = new AuthService();
