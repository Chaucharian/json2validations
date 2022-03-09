import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";

const config = {
  input: "src/main.ts",
  output: {
    dir: "dist",
    format: "umd",
    name: "window",
  },
  plugins: [nodeResolve(), typescript({ tsconfig: "./tsconfig.json" })],
};

export default config;
