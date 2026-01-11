import { test, expect } from "@playwright/test";
import { TEST_USER, generateUserData } from "../fixtures/test-data";

// Clear any leftover session state before each test
test.beforeEach(async ({ context }) => {
  await context.clearCookies();
});

test.describe("Login Page (Unauthenticated)", () => {
  test("displays login form", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    // Check form elements are visible (CardTitle is a div, not heading)
    await expect(page.locator("[data-slot='card-title']").filter({ hasText: "Entrar" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Senha")).toBeVisible();
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
  });

  test("shows error for invalid credentials", async ({ page }) => {
    await page.goto("/login");

    // Fill invalid credentials
    await page.getByLabel("Email").fill("invalid@example.com");
    await page.getByLabel("Senha").fill("wrongpassword");
    await page.getByRole("button", { name: "Entrar" }).click();

    // Should show error
    await expect(page.getByText(/falha|erro|invalid/i)).toBeVisible({
      timeout: 5000,
    });
  });

  test("can login with valid test credentials", async ({ page }) => {
    await page.goto("/login");

    // Fill test user credentials
    await page.getByLabel("Email").fill(TEST_USER.email);
    await page.getByLabel("Senha").fill(TEST_USER.password);
    await page.getByRole("button", { name: "Entrar" }).click();

    // Should redirect to dashboard or select-organization
    await expect(page).toHaveURL(/\/(dashboard|select-organization)/, { timeout: 10000 });
  });

  test("has link to register page", async ({ page }) => {
    await page.goto("/login");

    // Check register link exists
    const registerLink = page.getByRole("link", { name: /criar conta/i });
    await expect(registerLink).toBeVisible();

    // Click and verify navigation
    await registerLink.click();
    await expect(page).toHaveURL("/register");
  });

  test("validates required fields", async ({ page }) => {
    await page.goto("/login");

    // Check that email input has required attribute
    const emailInput = page.getByLabel("Email");
    await expect(emailInput).toHaveAttribute("required");
  });
});

test.describe("Register Page (Unauthenticated)", () => {
  test("displays registration form", async ({ page }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle");

    // Check form elements are visible (CardTitle is a div, not heading)
    await expect(page.locator("[data-slot='card-title']").filter({ hasText: "Criar conta" })).toBeVisible();
    await expect(page.getByLabel("Nome completo")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Confirmar senha")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Criar conta" })
    ).toBeVisible();
  });

  test("validates password match", async ({ page }) => {
    const user = generateUserData(); // Unique data for each test run

    await page.goto("/register");

    // Fill form with mismatched passwords
    await page.getByLabel("Nome completo").fill(user.name);
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Senha", { exact: true }).fill("password123");
    await page.getByLabel("Confirmar senha").fill("differentpassword");

    await page.getByRole("button", { name: "Criar conta" }).click();

    // Should show password mismatch error
    await expect(page.getByText(/senhas.*coincidem/i)).toBeVisible({
      timeout: 5000,
    });
  });

  test("validates minimum password length", async ({ page }) => {
    const user = generateUserData(); // Unique data for each test run

    await page.goto("/register");

    // Fill form with short password
    await page.getByLabel("Nome completo").fill(user.name);
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Senha", { exact: true }).fill("short");
    await page.getByLabel("Confirmar senha").fill("short");

    await page.getByRole("button", { name: "Criar conta" }).click();

    // Should show password length error
    await expect(page.getByText(/8 caracteres/i)).toBeVisible({ timeout: 5000 });
  });

  test("has link to login page", async ({ page }) => {
    await page.goto("/register");

    // Check login link exists
    const loginLink = page.getByRole("link", { name: /entrar/i });
    await expect(loginLink).toBeVisible();

    // Click and verify navigation
    await loginLink.click();
    await expect(page).toHaveURL("/login");
  });
});
