import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // CommonJS project files
  {
    files: ["**/*.js", "**/*.cjs"],
    ...js.configs.recommended,
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
  },

  // ESLint config file (ES Module)
  {
    files: ["eslint.config.mjs"],
    ...js.configs.recommended,
    languageOptions: {
      sourceType: "module",
      globals: globals.node,
    },
  },
]);