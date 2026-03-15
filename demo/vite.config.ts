import type { UserConfig } from "vite";

const config: UserConfig = {
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 1234,
  },
};

export default config;
