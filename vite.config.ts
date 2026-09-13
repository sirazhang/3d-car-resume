import { defineConfig } from "vite";

export default defineConfig({
  // Skip @vitejs/plugin-react (Babel). JSX is handled by esbuild.
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    headers: {
      "Cache-Control": "no-store",
    },
  },
  assetsInclude: ["**/*.glb"],
});
