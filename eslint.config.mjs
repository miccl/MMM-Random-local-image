import eslintPluginImport from "eslint-plugin-import";
import eslintPluginJs from "@eslint/js";
import globals from "globals";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

const config = [
  eslintPluginImport.flatConfigs.recommended,
  eslintPluginJs.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        Log: "readonly",
      },
      sourceType: "commonjs",
    },
  },
];

export default config;
