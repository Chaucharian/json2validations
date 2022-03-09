import babel from "@rollup/plugin-babel";
import typescript from "@rollup/plugin-typescript";

const config = {
  input: "src/main.ts",
  output: {
    dir: "output",
    format: "commonjs",
  },
  plugins: [
    typescript({ tsconfig: "./tsconfig.json" }),
    // babel({ babelHelpers: "bundled", presets: ["@babel/preset-typescript"] }),
  ],
};

export default config;
