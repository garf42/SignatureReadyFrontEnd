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

/** `@fontsource/*` resolves to nothing.
 *
 *  `enforce: "pre"` is load-bearing and was missing. Without it Vite's own
 *  resolver reaches the specifier first and hands back a real path, so this
 *  plugin never sees `@fontsource/...` and every face is bundled — 38
 *  `@font-face` rules and 1.25 MB of base64 woff, inlined because
 *  `assetsInlineLimit` is set to swallow everything into one file. The page
 *  then shipped each face TWICE, since it also links the same three from
 *  Google Fonts, and the assertion below only ever checked that no OTHER
 *  request survived.
 *
 *  The path test is the belt to that brace: whatever a resolver returns, a
 *  fontsource file is a fontsource file. */
const NO_FONT_FILES = {
  name: "no-fontsource",
  enforce: "pre" as const,
  resolveId(id: string) {
    return id.startsWith("@fontsource/") || id.includes("/@fontsource/")
      ? "\0empty-font"
      : null;
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
