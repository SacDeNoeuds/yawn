import path from "node:path";
import type { UserConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const config: UserConfig = {
  plugins: [
    tsconfigPaths({
      root: path.resolve(__dirname, "."),
      projects: ["./tsconfig.json"],
    }),
  ],
  server: {
    port: 1234,
  },
};

export default config;
