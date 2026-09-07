import js from "@eslint/js";
import globals from "globals";
import importPlugin from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

/** A SUPERSET of the host's rule set, so this tree cannot pass here and fail
 *  there. Every rule the Foundry template turns on is turned on here, plus two
 *  the template does not have.
 *
 *  The last integration found `curly` firing 23 times on these files. It was
 *  resolved host-side by scoping that rule off for `src/ui/**`, which works and
 *  is a permanent wart: a reformat host-side would put every future re-import
 *  in conflict with its source. Adopting the host's bar here instead means the
 *  exception can be deleted and never needed again.
 *
 *  NOTHING HERE IS A WARNING. The host runs `--max-warnings 0`, so a warning
 *  and an error are the same outcome there; making them the same severity here
 *  means the bar and the config cannot drift apart, and `npm run lint` means
 *  the same thing in both places. Two host rules are warnings upstream and
 *  errors here — react-hooks/exhaustive-deps and react-refresh/only-export-
 *  components — which is stricter, and so still a superset.
 *
 *  Two rules run here that the host does not list, and they are the reason
 *  "superset" is stated in one direction only:
 *    - @typescript-eslint/consistent-type-imports, which keeps the tree's
 *      `import type` discipline enforced rather than merely observed.
 *    - the no-cross-tree-imports guard below, which is what makes the port
 *      free.
 */
export default tseslint.config(
  { ignores: ["dist", "node_modules", "**/*.md"] },

  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      react.configs.flat.recommended,
      jsxA11y.flatConfigs.recommended
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } }
    },
    settings: {
      react: { version: "detect" },
      "import/resolver": { typescript: true, node: true }
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      import: importPlugin
    },
    rules: {
      // --- the host's set ---
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
      "react-refresh/only-export-components": ["error", { allowConstantExport: true }],
      "import/named": "error",
      "import/default": "error",
      "import/namespace": "error",
      "import/no-duplicates": "error",
      "import/no-extraneous-dependencies": "error",
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-console": "error",
      curly: ["error", "all"],
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],

      // --- this repository's own two ---
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" }
      ]
    }
  },

  /** The property that made the last port cost nothing: every import inside the
   *  deliverable is `@/ui/…`, so not one path needed rewriting when the tree
   *  moved. That held by care rather than by construction, and care does not
   *  survive a year. It is a rule now.
   *
   *  A relative import silently reintroduces a dependency on where the tree was
   *  placed; an `@/` import that is not `@/ui/` reaches into shell territory,
   *  which the shell owns and replaces. */
  {
    files: ["src/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["./*", "../*"],
              message:
                "src/ui/ is self-contained: import through the @/ui/… alias, never relatively. A relative path ties this file to where the tree happens to sit."
            },
            {
              // Regex rather than a negated group: gitignore-style negation
              // inside a group does not un-match here, and a rule that fires on
              // every legitimate import is a rule someone turns off.
              regex: "^@/(?!ui/)",
              message:
                "src/ui/ may not reach outside itself. Everything above it is shell-owned and is replaced on arrival."
            }
          ]
        }
      ]
    }
  },

  /** The one exemption, named rather than blanket. This file's whole job is to
   *  check the application hosting the tree, so it reads the host's own
   *  package.json — and a contract that could only see its own side would be
   *  checking nothing. */
  {
    files: ["src/ui/host-contract.test.ts"],
    rules: { "no-restricted-imports": "off" }
  },

  {
    files: ["scripts/**/*.{js,mjs}", "*.config.{js,ts}"],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node }
  },

  /* The review harness under scripts/preview. It is a build ENTRY — it calls
     createRoot at module scope — so fast refresh could never apply to it, and
     the rule that keeps a component file refreshable is asking for something
     the file cannot be. Everything else stays on, and none of this ships:
     nothing under src/ui imports it, so the packet is still one rename. */
  {
    files: ["scripts/preview/**/*.tsx"],
    rules: { "react-refresh/only-export-components": "off" }
  }
);
