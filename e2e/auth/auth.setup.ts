import { test as setup, expect } from "@playwright/test";
import { TEST_USER, TEST_ORG } from "../fixtures/test-data";

/**
 * Authentication setup - runs once before all authenticated tests.
 * User is seeded in global-setup.ts, so this just logs in.
 */
setup("authenticate", async ({ page }) => {
  await page.goto("/login");

  // Fill login form with seeded test user credentials
  await page.getByLabel("Email").fill(TEST_USER.email);
  await page.getByLabel("Senha").fill(TEST_USER.password);
  await page.getByRole("button", { name: "Entrar" }).click();

  // Wait for navigation
  await page.waitForTimeout(3000);

  // Handle organization selection if needed
  if (page.url().includes("/select-organization")) {
    // Try to select existing org or create one
    const existingOrg = page.getByText(TEST_ORG.name);
    if (await existingOrg.isVisible({ timeout: 2000 }).catch(() => false)) {
      await existingOrg.click();
      await page.waitForTimeout(1000);
    } else {
      // Create new org
      const createBtn = page.getByRole("button", { name: /criar.*organiza/i });
      if (await createBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await createBtn.click();
        await page.waitForTimeout(500);

        const nameInput = page.getByLabel(/nome/i);
        if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
          await nameInput.fill(TEST_ORG.name);
          await page.getByRole("button", { name: /criar/i }).last().click();
          await page.waitForTimeout(2000);
        }
      }
    }
  }

  // Should be on dashboard now
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

  // Save auth state for all authenticated tests
  await page.context().storageState({ path: "e2e/.auth/user.json" });
});
