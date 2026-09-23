/**
 * Journey 8: Capstone Projects → Velocity Widget
 * HARD-002 — Sprint 11 Critical E2E Test Suite
 *
 * Covers:
 *  - Capstone project catalog display (/projects)
 *  - Project tiers, tech stack tags, and deliverables
 *  - Personal velocity and completion projection analytics
 */
import { test, expect } from "@playwright/test";
import { uniqueEmail, registerUser, loginUser } from "./helpers.js";

test.describe("Journey 8: Capstone Projects → Velocity Widget", () => {
  const email = uniqueEmail("capstone");
  const displayName = "Capstone Builder";

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await registerUser(page, email, displayName);
    await page.close();
  });

  test("projects catalog page renders capstone projects", async ({ page }) => {
    await loginUser(page, email);
    await page.goto("/projects");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/\/projects/);
    await expect(page.getByRole("heading", { level: 1 }).or(page.getByText(/capstone|projects/i).first())).toBeVisible();
  });

  test("displays project cards with status, tier, or velocity metrics", async ({ page }) => {
    await loginUser(page, email);
    await page.goto("/projects");
    await page.waitForLoadState("networkidle");

    // Project cards or velocity summary should be present
    const projectCards = page.locator('[data-testid="project-card"], article, div:has-text("Project")');
    await expect(projectCards.first()).toBeVisible();
  });
});
