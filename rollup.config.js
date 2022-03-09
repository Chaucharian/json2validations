import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";

const config = [
  // {
  //   input: "src/main.ts",
  //   output: {
  //     : "dist",
  //     format: "umd",
  //     name: "window",
  //   },
  //   plugins: [nodeResolve(), typescript({ tsconfig: "./tsconfig.json" })],
  // },
  {
    input: "src/main.ts",
    output: {
      file: "dist/build.es.js",
      // dir: "dist",
      format: "es",
      name: "window",
    },
    plugins: [nodeResolve(), typescript({ tsconfig: "./tsconfig.json" })],
  },
  {
    input: "src/main.ts",
    output: {
      file: "dist/build.js",
      // dir: "dist",
      format: "cjs",
      name: "window",
    },
    plugins: [nodeResolve(), typescript({ tsconfig: "./tsconfig.json" })],
  },
];

export default config;
