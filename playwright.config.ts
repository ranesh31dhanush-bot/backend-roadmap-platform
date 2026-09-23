import { defineConfig, devices } from "@playwright/test";

/**
 * HARD-002: Sprint 11 — 8 Critical E2E User Journey Test Suite
 *
 * Requirements:
 *  - Frontend must be running on http://localhost:3000
 *  - Backend must be running on http://localhost:5000
 *
 * To run: npm run test:e2e (from monorepo root)
 * Both servers must be started before running tests.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,       // Sequential to avoid test data collisions
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,                 // Single worker to isolate cross-journey state
  reporter: [["html", { open: "never" }], ["list"]],
  timeout: 30000,             // 30s per test
  expect: { timeout: 10000 }, // 10s for assertions

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    // Share cookies/storage within each spec file but isolate between files
    storageState: undefined,
    // Capture network for debugging
    video: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // NOTE: webServer is not configured here because the dev servers require
  // the .env file with MONGODB_URI which cannot be embedded in config.
  // Start servers manually: npm run dev:backend && npm run dev:frontend
});
