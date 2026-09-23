import { z } from "zod";
import dotenv from "dotenv";
import path from "node:path";

// Load .env file from root or local directory
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(5000),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  BACKEND_URL: z.string().url().default("http://localhost:5000"),

  // ─── Database ───────────────────────────────────────────────────────────────
  // IMPORTANT: No default is provided for MONGODB_URI.
  // In production this MUST be set via environment variable — not source code.
  // In development/test, provide it in .env (see .env.example).
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required — set it in your .env file"),
  MONGODB_POOL_SIZE: z.coerce.number().default(20),

  // ─── Authentication & Session ────────────────────────────────────────────────
  // Dev-only placeholder defaults are intentionally weak strings.
  // In production these MUST be replaced with 64+ character random secrets.
  // The production guard below enforces this at startup.
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, "JWT_ACCESS_SECRET must be at least 32 characters")
    .default("dev_jwt_access_secret_min_32_characters_long_12345"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters")
    .default("dev_jwt_refresh_secret_min_32_characters_long_12345"),
  COOKIE_SECRET: z
    .string()
    .min(32, "COOKIE_SECRET must be at least 32 characters")
    .default("dev_cookie_signing_secret_min_32_characters_long_12345"),
  COOKIE_DOMAIN: z.string().default("localhost"),
  COOKIE_SECURE: z
    .string()
    .transform((val) => val === "true")
    .default("false"),

  // ─── Logging ─────────────────────────────────────────────────────────────────
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),
});

export type EnvConfig = z.infer<typeof envSchema>;

/** Known weak dev-placeholder secrets — must never be used in production */
const DEV_PLACEHOLDER_SECRETS = [
  "dev_jwt_access_secret_min_32_characters_long_12345",
  "dev_jwt_refresh_secret_min_32_characters_long_12345",
  "dev_cookie_signing_secret_min_32_characters_long_12345",
];

function loadEnv(): EnvConfig {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Environment configuration validation failed:");
    console.error(JSON.stringify(result.error.format(), null, 2));
    process.exit(1);
  }

  const config = result.data;

  // ─── Production Security Guard ────────────────────────────────────────────────
  // Refuse to start with known dev placeholder secrets in production.
  // This prevents accidentally shipping insecure defaults to production.
  if (config.NODE_ENV === "production") {
    const weakSecrets = [config.JWT_ACCESS_SECRET, config.JWT_REFRESH_SECRET, config.COOKIE_SECRET];
    const hasWeak = weakSecrets.some((s) => DEV_PLACEHOLDER_SECRETS.includes(s));
    if (hasWeak) {
      console.error(
        "❌ SECURITY: Production environment detected one or more weak dev-placeholder secrets.\n" +
          "   Set strong random values for JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, and COOKIE_SECRET.\n" +
          "   Refusing to start.",
      );
      process.exit(1);
    }

    if (!config.COOKIE_SECURE) {
      console.warn(
        "⚠️  WARNING: COOKIE_SECURE=false in production. Set COOKIE_SECURE=true for HTTPS deployments.",
      );
    }
  }

  return config;
}

export const env = loadEnv();
