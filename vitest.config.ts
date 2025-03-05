import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    browser: {
      provider: "playwright", // or 'webdriverio'
      enabled: true,
      headless: true, // デフォルトでheadlessモードを有効化
      screenshotFailures: false,
      // インスタンス設定はvitest.workspace.tsで行う
    },
    environment: "happy-dom",
    environmentOptions: {
      // jsdomのオプションを削除
    },
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/.next/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
