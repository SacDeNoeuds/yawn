import type { UserConfig } from "vite";
import analyzer from 'vite-bundle-analyzer';

const config: UserConfig = {
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [analyzer({ fileName: 'bundle-stats.html', analyzerMode: 'static' })],
  server: {
    port: 1234,
  },
};

export default config;
