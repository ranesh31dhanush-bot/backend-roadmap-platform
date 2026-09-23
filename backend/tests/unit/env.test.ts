import { describe, it, expect } from "vitest";
import { env } from "../../src/config/env.js";

describe("Environment Configuration", () => {
  it("loads and validates default environment configuration", () => {
    expect(env).toBeDefined();
    expect(["development", "test", "production"]).toContain(env.NODE_ENV);
    expect(typeof env.PORT).toBe("number");
    expect(env.FRONTEND_URL).toMatch(/^https?:\/\//);
    expect(env.MONGODB_URI).toBeDefined();
  });
});
