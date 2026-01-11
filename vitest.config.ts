import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.ts", "convex/**/*.test.ts"],
    exclude: ["node_modules", ".next", "convex/_generated"],
    pool: "forks",
    maxWorkers: 1, // Sequential execution for shared backend
    coverage: {
      provider: "v8",
      include: ["convex/**/*.ts"],
      exclude: ["convex/_generated/**", "**/*.test.ts"],
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./") },
  },
});
