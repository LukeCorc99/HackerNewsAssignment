/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import type { ViteUserConfigExport } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/HackerNewsAssignment/",
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
        "**/vite.config.ts",
        "**/playwright.config.ts",
      ],
    },
  },
}) as ViteUserConfigExport;
