import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

export default [
  {
    input: "./src/MMM-Random-local-image.ts",
    plugins: [typescript(), resolve(), commonjs()],
    output: {
      file: "./MMM-Random-local-image.js",
      format: "iife",
    },
  },
  {
    input: "./src/node_helper.ts",
    plugins: [typescript()],
    output: {
      file: "./node_helper.js",
      format: "umd",
    },
  },
];
