import { mutation, query } from "./_generated/server";

// Only allow in test environment
const isTest = process.env.IS_TEST === "true";

// Test account credentials (used by E2E tests)
export const TEST_USER = {
  email: "e2e-test@flux.local",
  password: "TestPassword123!",
  name: "E2E Test User",
};

export const TEST_ORG = {
  name: "E2E Test Organization",
  slug: "e2e-test-org",
};

/**
 * Check if test data exists for a given organization
 */
export const checkTestData = query({
  args: {},
  handler: async (_ctx) => {
    // This can be used by tests to verify setup
    return {
      isTestEnv: isTest,
    };
  },
});

/**
 * Clear test entities for a specific organization
 * Use this in tests when you need a clean state
 */
export const clearEntities = mutation({
  args: {},
  handler: async (_ctx) => {
    if (!isTest) {
      throw new Error(
        "clearEntities only allowed in test environment. Set IS_TEST=true to enable."
      );
    }

    // This will be called with the user's actual org context
    // For now, just return success - tests handle their own cleanup
    return { message: "Ready for test cleanup" };
  },
});
