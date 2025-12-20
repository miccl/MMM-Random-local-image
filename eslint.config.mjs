import eslintPluginImport from "eslint-plugin-import";
import eslintPluginJs from "@eslint/js";
import globals from "globals";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import eslintPluginTsEslint from "typescript-eslint";

const config = [
  // import plugin recommendations
  eslintPluginImport.flatConfigs.recommended,

  // base JS rules
  eslintPluginJs.configs.recommended,

  // TypeScript: use type-checked recommended rules
  ...eslintPluginTsEslint.configs.recommendedTypeChecked,

  // Prettier
  eslintPluginPrettierRecommended,

  // Global defaults (apply to all files unless overridden below)
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        Log: "readonly",
      },
      parserOptions: {
        projectService: {
          // let typescript-eslint find your tsconfig.json in the project
          defaultProject: "./tsconfig.json",
        },
      },
    },

    plugins: {
      import: eslintPluginImport,
    },

    settings: {
      "import/resolver": {
        typescript: {
          // path to your tsconfig; adjust if different
          project: "./tsconfig.json",
        },
      },
    },

    // shared rules for all files
    rules: {
      // Example: let TS handle unused vars
      // "no-unused-vars": "off",
      // "@typescript-eslint/no-unused-vars": ["error"],
    },
  },
];

export default config;
