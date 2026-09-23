import { test, expect } from "@playwright/test";

test("Homepage renders Sprint 0 foundation banner and dark theme", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Top 1% Backend Developer Roadmap");
  await expect(page.locator("text=SPRINT 0 — ARCHITECTURE FOUNDATION READY")).toBeVisible();
});
