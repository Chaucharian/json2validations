import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

const config = [
  {
    input: "src/main.ts",
    output: {
      file: "dist/build.es.js",
      format: "es",
      name: "window",
    },
    plugins: [
      nodeResolve(),
      typescript({ tsconfig: "./tsconfig.json" }),
      terser(),
    ],
  },
  {
    input: "src/main.ts",
    output: {
      file: "dist/build.js",
      format: "cjs",
      name: "window",
    },
    plugins: [
      nodeResolve(),
      typescript({ tsconfig: "./tsconfig.json" }),
      terser(),
    ],
  },
];

export default config;
