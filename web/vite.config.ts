import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  // In the cluster, Traefik sends http://localhost:8080/ here. The browser reaches Vite's live
  // updates through Traefik too: same host and port as the page, nothing to configure.
  server: { host: true, port: 5173, strictPort: true },
});
