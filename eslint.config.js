import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

/** Foundry CI runs `npm run lint -- --max-warnings 0`. Nothing here is a
 *  warning: every rule this repo turns on is an error, so the bar and the
 *  config cannot drift apart. */
export default tseslint.config(
  { ignores: ["dist", "node_modules", "PORT-ADDITIONS.md"] },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser
    },
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-console": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" }
      ]
    }
  },
  {
    files: ["scripts/**/*.{js,mjs}", "*.config.{js,ts}"],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node }
  }
);
