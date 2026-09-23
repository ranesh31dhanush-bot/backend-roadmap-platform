import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, hashToken, generateSecureToken, generateCsrfToken } from "../../src/modules/auth/crypto.utils.js";

describe("Crypto Utilities", () => {
  it("hashes password and verifies correctly with bcrypt cost 12", async () => {
    const rawPassword = "SuperSecurePassword123!";
    const hash = await hashPassword(rawPassword);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(rawPassword);
    expect(hash.startsWith("$2a$12$") || hash.startsWith("$2b$12$")).toBe(true);

    const isMatch = await verifyPassword(rawPassword, hash);
    expect(isMatch).toBe(true);

    const isWrong = await verifyPassword("WrongPassword123!", hash);
    expect(isWrong).toBe(false);
  });

  it("hashes tokens deterministically with SHA-256", () => {
    const token = "sample_raw_refresh_token_12345";
    const hash1 = hashToken(token);
    const hash2 = hashToken(token);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  it("generates cryptographically secure random tokens and CSRF tokens", () => {
    const token1 = generateSecureToken(32);
    const token2 = generateSecureToken(32);
    expect(token1).not.toBe(token2);
    expect(token1).toHaveLength(64);

    const csrf = generateCsrfToken();
    expect(csrf).toBeDefined();
    expect(typeof csrf).toBe("string");
  });
});
