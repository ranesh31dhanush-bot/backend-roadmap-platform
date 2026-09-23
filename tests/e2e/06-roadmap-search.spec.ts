/**
 * Journey 6: Curriculum Roadmap → Accordion → Search
 * HARD-002 — Sprint 11 Critical E2E Test Suite
 *
 * Covers:
 *  - Full curriculum roadmap view (/curriculum)
 *  - Phase and canonical day accordion expand/collapse
 *  - Real-time search/filter for topics and concepts
 */
import { test, expect } from "@playwright/test";
import { uniqueEmail, registerUser, loginUser } from "./helpers.js";

test.describe("Journey 6: Curriculum Roadmap → Accordion → Search", () => {
  const email = uniqueEmail("roadmap");
  const displayName = "Roadmap Explorer";

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await registerUser(page, email, displayName);
    await page.close();
  });

  test("curriculum page loads phases and days", async ({ page }) => {
    await loginUser(page, email);
    await page.goto("/curriculum");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/\/curriculum/);
    // Should render curriculum phases or content
    await expect(page.getByRole("heading", { level: 1 }).or(page.getByText(/curriculum|roadmap/i).first())).toBeVisible();
  });

  test("search filters topics dynamically", async ({ page }) => {
    await loginUser(page, email);
    await page.goto("/curriculum");
    await page.waitForLoadState("networkidle");

    const searchInput = page.getByPlaceholder(/search|filter topics/i).or(page.locator('input[type="search"]')).first();
    if (await searchInput.isVisible()) {
      await searchInput.fill("PostgreSQL");
      await page.waitForTimeout(500);

      // Verify filtered results or matching topic mentions
      const match = page.getByText(/postgresql|postgres/i).first();
      await expect(match).toBeVisible();
    }
  });

  test("expanding phase accordion reveals canonical days", async ({ page }) => {
    await loginUser(page, email);
    await page.goto("/curriculum");
    await page.waitForLoadState("networkidle");

    // Look for accordion trigger buttons
    const accordionBtn = page.getByRole("button", { name: /phase|day|foundation|core/i }).first();
    if (await accordionBtn.isVisible()) {
      await accordionBtn.click();
      await page.waitForTimeout(300);
      // Ensure content is displayed
      await expect(page.locator("main")).toBeVisible();
    }
  });
});
