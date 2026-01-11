import { execSync } from "child_process";
import { existsSync, writeFileSync, readFileSync, mkdirSync } from "fs";
import path from "path";
import { chromium } from "@playwright/test";

const ENV_TEST_FILE = path.join(process.cwd(), ".env.test.local");
const CONVEX_URL = "http://127.0.0.1:3210";
const CONVEX_SITE_URL = "http://127.0.0.1:3211";

function execCommand(command: string, options?: { silent?: boolean }): string {
  try {
    const result = execSync(command, {
      encoding: "utf-8",
      stdio: options?.silent ? "pipe" : "inherit",
    });
    return result?.trim() || "";
  } catch (error) {
    if (!options?.silent) {
      console.error(`Command failed: ${command}`);
    }
    throw error;
  }
}

function isDockerRunning(): boolean {
  try {
    execSync("docker info", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

function isConvexBackendRunning(): boolean {
  try {
    execSync(`curl -sf ${CONVEX_URL}/version`, { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

function waitForBackend(maxAttempts = 30): boolean {
  console.log("Waiting for Convex backend to be ready...");
  for (let i = 0; i < maxAttempts; i++) {
    if (isConvexBackendRunning()) {
      console.log("Convex backend is ready!");
      return true;
    }
    execSync("sleep 1");
  }
  return false;
}

function getOrCreateAdminKey(): string {
  // Check if we already have a key in the env file
  if (existsSync(ENV_TEST_FILE)) {
    const content = readFileSync(ENV_TEST_FILE, "utf-8");
    const match = content.match(/CONVEX_SELF_HOSTED_ADMIN_KEY=(.+)/);
    if (match && match[1] && match[1] !== "your_admin_key_here") {
      return match[1];
    }
  }

  // Generate a new admin key
  console.log("Generating new admin key...");
  const output = execSync(
    "docker compose exec -T backend ./generate_admin_key.sh",
    { encoding: "utf-8" }
  );

  // Parse the admin key from output (format varies, look for the key)
  const keyMatch = output.match(/Admin key: (.+)|^([a-zA-Z0-9_-]{20,})$/m);
  if (keyMatch) {
    return (keyMatch[1] || keyMatch[2]).trim();
  }

  // If parsing fails, the whole output might be the key
  return output.trim().split("\n").pop()?.trim() || "";
}

function deployConvex(adminKey: string): void {
  console.log("Deploying Convex functions to local backend...");

  // Ensure .env.test.local exists with correct values (no CONVEX_DEPLOYMENT)
  const envContent = `# Auto-generated for E2E tests - DO NOT include CONVEX_DEPLOYMENT
CONVEX_SELF_HOSTED_URL=${CONVEX_URL}
CONVEX_SELF_HOSTED_ADMIN_KEY=${adminKey}
NEXT_PUBLIC_CONVEX_URL=${CONVEX_URL}
NEXT_PUBLIC_CONVEX_SITE_URL=${CONVEX_SITE_URL}
NEXT_PUBLIC_SITE_URL=http://localhost:3000
BETTER_AUTH_SECRET=e2e-test-secret-key-min-32-chars-long
IS_TEST=true
`;
  writeFileSync(ENV_TEST_FILE, envContent);

  try {
    // Use --env-file to override .env.local and avoid CONVEX_DEPLOYMENT conflict
    execSync(`bunx convex deploy --yes --env-file ${ENV_TEST_FILE}`, {
      stdio: "inherit",
      timeout: 120000, // 2 minute timeout
    });
    console.log("Convex functions deployed!");
  } catch (error) {
    console.error("Failed to deploy Convex functions:", error);
    throw error;
  }
}

export default async function globalSetup() {
  console.log("\n========== E2E Test Setup ==========\n");

  // 1. Check Docker is running
  if (!isDockerRunning()) {
    throw new Error(
      "Docker is not running. Please start Docker and try again."
    );
  }

  // 2. Start local Convex backend if not running
  if (!isConvexBackendRunning()) {
    console.log("Starting local Convex backend...");
    execCommand("docker compose up -d");

    if (!waitForBackend()) {
      throw new Error("Convex backend failed to start");
    }
  } else {
    console.log("Convex backend is already running");
  }

  // 3. Get or create admin key
  const adminKey = getOrCreateAdminKey();
  if (!adminKey) {
    throw new Error("Failed to get admin key");
  }

  // 4. Deploy Convex functions (also creates .env.test.local)
  deployConvex(adminKey);

  // 5. Set environment variables on the Convex deployment
  console.log("Setting environment variables on Convex deployment...");
  try {
    execSync(
      `bunx convex env set BETTER_AUTH_SECRET "e2e-test-secret-key-min-32-chars-long" --env-file ${ENV_TEST_FILE}`,
      { stdio: "inherit", timeout: 30000 }
    );
    execSync(
      `bunx convex env set IS_TEST "true" --env-file ${ENV_TEST_FILE}`,
      { stdio: "inherit", timeout: 30000 }
    );
  } catch {
    // May already be set, continue
    console.log("Environment variables may already be set, continuing...");
  }

  // 6. Ensure auth directory exists for Playwright storage state
  const authDir = path.join(process.cwd(), "e2e", ".auth");
  if (!existsSync(authDir)) {
    mkdirSync(authDir, { recursive: true });
    console.log("Created e2e/.auth directory");
  }

  // 7. Wait for Next.js to be ready (webServer starts it, but we need to wait)
  console.log("Waiting for Next.js server...");
  await waitForNextJS();

  // 8. Seed test user (idempotent - skips if user exists)
  await seedTestUser();

  console.log("\n========== Setup Complete ==========\n");
}

async function waitForNextJS(maxAttempts = 60): Promise<void> {
  const url = "http://localhost:3000";
  for (let i = 0; i < maxAttempts; i++) {
    try {
      execSync(`curl -sf ${url}`, { stdio: "pipe" });
      console.log("Next.js server is ready!");
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw new Error("Next.js server failed to start");
}

async function seedTestUser(): Promise<void> {
  console.log("Checking/seeding test user...");

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Try to login first - if succeeds, user already exists
    await page.goto("http://localhost:3000/login");
    await page.waitForLoadState("networkidle");

    console.log(`Current URL after login page: ${page.url()}`);

    // Check if we're already redirected (user might already be logged in)
    if (page.url().includes("/dashboard")) {
      console.log("✓ User already logged in");
      return;
    }

    // Fill login form
    const emailInput = page.getByLabel("Email");
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await emailInput.fill("e2e-test@flux.local");
      await page.getByLabel("Senha").fill("TestPassword123!");
      await page.getByRole("button", { name: "Entrar" }).click();

      await page.waitForTimeout(3000);
      console.log(`URL after login attempt: ${page.url()}`);

      if (page.url().includes("/dashboard")) {
        console.log("✓ Test user already exists (login succeeded)");
        return;
      }

      if (page.url().includes("/select-organization")) {
        console.log("User exists but needs org, handling...");
        await handleOrgSelection(page);
        return;
      }
    }

    // Login failed = user doesn't exist, register them
    console.log("Creating test user...");
    await page.goto("http://localhost:3000/register");
    await page.waitForLoadState("networkidle");

    console.log(`URL after navigating to register: ${page.url()}`);

    // Check if we can see the register form
    const nameInput = page.getByLabel("Nome completo");
    if (!(await nameInput.isVisible({ timeout: 5000 }).catch(() => false))) {
      console.log("Register form not visible, checking if already logged in...");
      console.log(`Current URL: ${page.url()}`);
      // May already be logged in and redirected
      if (page.url().includes("/dashboard")) {
        console.log("✓ Already authenticated");
        return;
      }
      throw new Error(`Cannot find register form. Current URL: ${page.url()}`);
    }

    await nameInput.fill("E2E Test User");
    await page.getByLabel("Email").fill("e2e-test@flux.local");
    await page.getByLabel("Senha").fill("TestPassword123!");
    await page.getByLabel("Confirmar senha").fill("TestPassword123!");
    await page.getByRole("button", { name: "Criar conta" }).click();

    await page.waitForTimeout(3000);
    console.log(`URL after registration: ${page.url()}`);

    // Handle org creation if redirected there
    if (page.url().includes("/select-organization")) {
      await handleOrgSelection(page);
    }

    console.log("✓ Test user created");
  } finally {
    await browser.close();
  }
}

async function handleOrgSelection(page: import("@playwright/test").Page): Promise<void> {
  console.log("Creating test organization...");

  // Wait for the page to load
  await page.waitForLoadState("networkidle");

  // Try to find and click create button
  const createBtn = page.getByRole("button", { name: /criar.*organiza/i });
  if (await createBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await createBtn.click();
    await page.waitForTimeout(500);

    const nameInput = page.getByLabel(/nome/i);
    if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nameInput.fill("E2E Test Organization");
      await page.getByRole("button", { name: /criar/i }).last().click();
      await page.waitForTimeout(2000);
    }
  }

  console.log("✓ Organization created");
}
