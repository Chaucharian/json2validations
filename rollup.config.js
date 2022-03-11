import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import filesize from "rollup-plugin-filesize";
import progress from "rollup-plugin-progress";
import visualizer from "rollup-plugin-visualizer";

const config = [
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.es.js",
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
    input: "src/index.ts",
    output: {
      file: "dist/index.js",
      format: "cjs",
      name: "window",
    },
    plugins: [
      nodeResolve(),
      typescript({ tsconfig: "./tsconfig.json" }),
      terser(),
      filesize(),
      progress(),
      visualizer(),
    ],
  },
];

export default config;
