/** The review build. Outside `src/ui/` on purpose: nothing here ships, the
 *  packet stays a directory rename, and the harness can import from the tree
 *  without the tree ever importing the harness.
 *
 *  Two deliberate differences from the application build, and no others:
 *
 *  1. `@fontsource/*` resolves to nothing. Those imports emit woff2 files, and
 *     a published page has to be ONE file. The same three faces are linked from
 *     Google Fonts in the published fragment instead — the one font host that
 *     surface admits — and `theme.css` already declares the fallback stacks, so
 *     the type is the type either way.
 *  2. Everything inlines: no code splitting, no separate stylesheet, no asset
 *     under the limit left on disk.
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const NO_FONT_FILES = {
  name: "no-fontsource",
  resolveId(id: string) {
    return id.startsWith("@fontsource/") ? "\0empty-font" : null;
  },
  load(id: string) {
    return id === "\0empty-font" ? "" : null;
  }
};

export default defineConfig({
  plugins: [react(), NO_FONT_FILES],
  base: "./",
  root: new URL(".", import.meta.url).pathname,
  resolve: { alias: { "@": new URL("../../src", import.meta.url).pathname } },
  build: {
    outDir: new URL("../../dist-walk/preview/", import.meta.url).pathname,
    emptyOutDir: true,
    cssCodeSplit: false,
    assetsInlineLimit: 100_000_000,
    modulePreload: { polyfill: false },
    rollupOptions: { output: { inlineDynamicImports: true } }
  }
});
