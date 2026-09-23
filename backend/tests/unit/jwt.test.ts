import { describe, it, expect } from "vitest";
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from "../../src/modules/auth/jwt.service.js";
import { SessionPayload } from "@top1/shared";

describe("JWT Service", () => {
  const samplePayload: SessionPayload = {
    userId: "user_64a1b2c3d4e5f6a7b8c9d0e1",
    email: "learner@example.com",
    role: "learner",
    sessionId: "sess_12345678",
  };

  it("signs and verifies an access token", () => {
    const token = signAccessToken(samplePayload);
    expect(typeof token).toBe("string");

    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe(samplePayload.userId);
    expect(decoded.email).toBe(samplePayload.email);
    expect(decoded.role).toBe(samplePayload.role);
    expect(decoded.sessionId).toBe(samplePayload.sessionId);
  });

  it("signs and verifies a refresh token", () => {
    const token = signRefreshToken(samplePayload);
    expect(typeof token).toBe("string");

    const decoded = verifyRefreshToken(token);
    expect(decoded.userId).toBe(samplePayload.userId);
    expect(decoded.sessionId).toBe(samplePayload.sessionId);
  });

  it("rejects an invalid token", () => {
    expect(() => verifyAccessToken("invalid.malformed.token")).toThrowError(/Invalid access token/);
  });
});
