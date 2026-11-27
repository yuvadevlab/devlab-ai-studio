import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  noExternal: ["@yuva-devlab/ui"],
  external: ["react", "react-dom", "next-themes", "lucide-react", "@yuva-devlab/tokens"],
});
