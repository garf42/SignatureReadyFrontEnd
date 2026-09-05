/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// No node: imports here on purpose — the single tsconfig types only vite/client.
export default defineConfig({
  plugins: [react()],
  base: "./",
  resolve: { alias: { "@": "/src" } },
  build: { outDir: "dist" },
  test: {
    environment: "jsdom",
    globals: false,
    include: ["src/**/*.test.{ts,tsx}"],
    css: false,
    restoreMocks: true
  }
});
