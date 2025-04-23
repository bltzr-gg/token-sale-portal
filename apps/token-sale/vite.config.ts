import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    dedupe: ["@tanstack/react-query"], // if two diff versions of react-query get bundled, it breaks
  },
  optimizeDeps: {
    // Vite was bugging out and not bundling local builds of these deps, this forces it to bundle them
    include: [
      "@axis-finance/abis",
      "@axis-finance/cloak",
      "@axis-finance/deployments",
      "@axis-finance/env",
      "@axis-finance/sdk",
      "@axis-finance/subgraph-client",
      "@axis-finance/types",
      "@tanstack/react-query",
    ],
    force: true,
    esbuildOptions: {
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
        }),
        NodeModulesPolyfillPlugin(),
      ],
    },
  },
  plugins: [
    sentryVitePlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: "rwg",
      project: "token-sale-portal",
    }),
    transformHTML(mode),
    react(),
    tsconfigPaths(),
  ],
}));

function transformHTML(mode: string) {
  const env = loadEnv(mode, process.cwd());

  return {
    name: "html-transform",
    transformIndexHtml(html: string) {
      if (env.VITE_ENVIRONMENT !== "production") {
        return html.replace(
          /<title>(.*?)<\/title>/,
          `<title>Real Token Testnet</title>`,
        );
      }
    },
  };
}
