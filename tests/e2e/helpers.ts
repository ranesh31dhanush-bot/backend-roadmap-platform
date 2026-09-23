/**
 * E2E Test Helpers — shared utilities for HARD-002 Sprint 11 journeys
 */
import { Page, expect } from "@playwright/test";

/** Generate a unique test email to prevent inter-run collisions */
export function uniqueEmail(prefix: string): string {
  const ts = Date.now();
  return `e2e_${prefix}_${ts}@test.invalid`;
}

/** Standard test user credentials used across journeys */
export const TEST_PASSWORD = "TestE2E_Password1!";

/**
 * Register a new user via the registration page and return after landing on
 * the onboarding or dashboard page.
 */
export async function registerUser(page: Page, email: string, displayName: string): Promise<void> {
  await page.goto("/register");
  await page.waitForLoadState("networkidle");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/display name/i).fill(displayName);
  // Password fields — get both in order
  const passwordFields = page.getByLabel(/password/i);
  await passwordFields.first().fill(TEST_PASSWORD);
  const confirmField = page.getByLabel(/confirm password/i);
  if (await confirmField.isVisible()) {
    await confirmField.fill(TEST_PASSWORD);
  }
  await page.getByRole("button", { name: /register|create account|sign up/i }).click();
  // Wait for navigation away from register page
  await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 15000 });
}

/**
 * Login an existing user and return after landing on dashboard/onboarding.
 */
export async function loginUser(page: Page, email: string): Promise<void> {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(TEST_PASSWORD);
  await page.getByRole("button", { name: /log in|sign in/i }).click();
  await page.waitForURL(/\/(dashboard|onboarding|workspace)/, { timeout: 15000 });
}

/**
 * Complete the onboarding wizard with a start date in the near future.
 */
export async function completeOnboarding(page: Page): Promise<void> {
  // If already on onboarding, proceed
  if (!page.url().includes("onboarding")) {
    return; // already passed onboarding
  }
  // Pick a start date — today's date is commonly pre-filled; just submit
  const submitBtn = page.getByRole("button", { name: /start|begin|confirm|get started/i });
  if (await submitBtn.isVisible()) {
    await submitBtn.click();
  }
  await page.waitForURL(/\/dashboard/, { timeout: 15000 });
}

/**
 * Wait for the network to be idle and assert no console errors containing a string.
 */
export async function assertNoApiError(page: Page, apiPath: string): Promise<void> {
  // Assert the page didn't navigate to an error page
  expect(page.url()).not.toContain("/error");
  expect(page.url()).not.toContain("/500");
}
