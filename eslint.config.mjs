import eslintPluginImport from "eslint-plugin-import";
import eslintPluginJs from "@eslint/js";
import globals from "globals";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default [
  // import plugin recommendations
  eslintPluginImport.flatConfigs.recommended,

  // base JS rules
  eslintPluginJs.configs.recommended,

  // TypeScript: use type-checked recommended rules (for TS files)
  // ...eslintPluginTsEslint.configs.recommendedTypeChecked,

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
          allowDefaultProject: true,
        },
      },
    },

    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
      },
    },

    rules: {},

    ignores: ["node_helper.js", "MMM-Random-local-image.js"],
  },

  // JS + config files: no type-aware projectService, no TS type-aware rules
  {
    files: [
      // config files
      "eslint.config.*",
      "**/*.config.*",
      "**/*.config.mjs",
      // JS files
      "**/*.js",
      "**/*.cjs",
      "**/*.mjs",
    ],
    languageOptions: {
      parserOptions: {
        projectService: null,
      },
    },
    rules: {
      // disable type-aware rules that assume types (like await-thenable)
      "@typescript-eslint/await-thenable": "off",
      // if you see other similar errors, you can turn them off here too
    },
  },

  // TS files: keep projectService (type-aware rules stay active)
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        projectService: {
          defaultProject: "./tsconfig.json",
          allowDefaultProject: true,
        },
      },
    },
  },
];
