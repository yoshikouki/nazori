import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  // If you want to keep running your existing tests in Node.js, uncomment the next line.
  // 'vitest.config.ts',
  {
    test: {
      name: "unit",
      environment: "node",
      include: ["src/**/*.{test,spec}.ts", "src/**/*.{test,spec}.tsx"],
      exclude: [
        "**/node_modules/**",
        "**/dist/**",
        "**/.next/**",
        "src/**/*.browser.{test,spec}.ts",
        "src/**/*.browser.{test,spec}.tsx",
      ],
    },
  },

  {
    extends: "vitest.config.ts",
    test: {
      name: "browser",
      browser: {
        enabled: true,
        provider: "playwright",
        // https://vitest.dev/guide/browser/playwright
        instances: [
          { name: "chromium", browser: "chromium" },
          { name: "webkit", browser: "webkit" },
        ],
      },
      include: ["src/**/*.browser.{test,spec}.ts", "src/**/*.browser.{test,spec}.tsx"],
      exclude: [
        "**/node_modules/**",
        "**/dist/**",
        "**/.next/**",
        "src/**/*.{test,spec}.ts",
        "src/**/*.{test,spec}.tsx",
      ],
    },
  },
]);
