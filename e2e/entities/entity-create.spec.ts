import { test, expect } from "@playwright/test";
import { generateCompanyData, generateIndividualData } from "../fixtures/test-data";

test.describe("Entity Creation", () => {
  test("creates a company entity with valid CNPJ", async ({ page }) => {
    const company = generateCompanyData();

    await page.goto("/entities/new");

    // Wait for form to load
    await expect(page.getByText("Nova Entidade")).toBeVisible();

    // Entity Type should default to "company"
    // Fill basic info
    await page.getByLabel(/Raz.*Social/i).fill(company.name);
    await page.getByLabel("Nome Fantasia").fill(company.tradeName);
    await page.getByLabel("CNPJ").fill(company.document);

    // Fill contact info
    await page.getByLabel("Email").fill(company.email);
    await page.getByLabel("Telefone").fill(company.phone);

    // Submit the form
    await page.getByRole("button", { name: "Criar Entidade" }).click();

    // Should redirect to entities list
    await expect(page).toHaveURL("/entities", { timeout: 10000 });

    // The new entity should be visible in the list
    await expect(page.getByText(company.name)).toBeVisible();
  });

  test("creates an individual entity with valid CPF", async ({ page }) => {
    const individual = generateIndividualData();

    await page.goto("/entities/new");
    await expect(page.getByText("Nova Entidade")).toBeVisible();

    // Change entity type to individual
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: /Pessoa F.*sica.*CPF/i }).click();

    // Fill basic info
    await page.getByLabel(/Nome Completo/i).fill(individual.name);
    await page.getByLabel("CPF").fill(individual.document);

    // Fill contact info
    await page.getByLabel("Email").fill(individual.email);
    await page.getByLabel("Telefone").fill(individual.phone);

    // Submit the form
    await page.getByRole("button", { name: "Criar Entidade" }).click();

    // Should redirect to entities list
    await expect(page).toHaveURL("/entities", { timeout: 10000 });

    // The new entity should be visible in the list
    await expect(page.getByText(individual.name)).toBeVisible();
  });

  test("shows validation error for invalid CNPJ", async ({ page }) => {
    await page.goto("/entities/new");
    await expect(page.getByText("Nova Entidade")).toBeVisible();

    // Fill with invalid CNPJ
    await page.getByLabel(/Raz.*Social/i).fill("Test Company LTDA");
    await page.getByLabel("CNPJ").fill("11111111111111"); // Invalid - all same digits

    // Submit the form
    await page.getByRole("button", { name: "Criar Entidade" }).click();

    // Should show validation error
    await expect(page.getByText(/inv.*lido/i)).toBeVisible({ timeout: 5000 });
  });

  test("shows validation error for invalid CPF", async ({ page }) => {
    await page.goto("/entities/new");
    await expect(page.getByText("Nova Entidade")).toBeVisible();

    // Change entity type to individual
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: /Pessoa F.*sica.*CPF/i }).click();

    // Fill with invalid CPF
    await page.getByLabel(/Nome Completo/i).fill("Test Person");
    await page.getByLabel("CPF").fill("00000000000"); // Invalid - all zeros

    // Submit the form
    await page.getByRole("button", { name: "Criar Entidade" }).click();

    // Should show validation error
    await expect(page.getByText(/inv.*lido/i)).toBeVisible({ timeout: 5000 });
  });

  test("requires at least one role (client or supplier)", async ({ page }) => {
    const company = generateCompanyData();

    await page.goto("/entities/new");
    await expect(page.getByText("Nova Entidade")).toBeVisible();

    // Fill basic info
    await page.getByLabel(/Raz.*Social/i).fill(company.name);
    await page.getByLabel("CNPJ").fill(company.document);

    // Turn off both client and supplier switches
    // Client is on by default, so click it to turn it off
    // Use the label to click the switch (more reliable than hidden checkbox)
    const clientLabel = page.locator("label[for='isClient']");
    await clientLabel.scrollIntoViewIfNeeded();
    await clientLabel.click();

    // Submit the form
    await page.getByRole("button", { name: "Criar Entidade" }).click();

    // Should show error about selecting at least one role
    await expect(
      page.getByText(/selecione pelo menos um tipo/i)
    ).toBeVisible({ timeout: 5000 });
  });

  test("can create entity as both client and supplier", async ({ page }) => {
    const company = generateCompanyData();

    await page.goto("/entities/new");
    await expect(page.getByText("Nova Entidade")).toBeVisible();

    // Fill basic info
    await page.getByLabel(/Raz.*Social/i).fill(company.name);
    await page.getByLabel("CNPJ").fill(company.document);

    // Enable supplier (client is on by default)
    // Use the label to click the switch (more reliable than hidden checkbox)
    const supplierLabel = page.locator("label[for='isSupplier']");
    await supplierLabel.scrollIntoViewIfNeeded();
    await supplierLabel.click();

    // Submit the form
    await page.getByRole("button", { name: "Criar Entidade" }).click();

    // Should redirect to entities list
    await expect(page).toHaveURL("/entities", { timeout: 10000 });

    // The new entity should be visible
    await expect(page.getByText(company.name)).toBeVisible();
  });

  test("cancel button returns to entities list", async ({ page }) => {
    await page.goto("/entities/new");
    await expect(page.getByText("Nova Entidade")).toBeVisible();

    // Click cancel
    await page.getByRole("button", { name: "Cancelar" }).click();

    // Should redirect to entities list
    await expect(page).toHaveURL("/entities");
  });
});
