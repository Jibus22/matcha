import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      const isDev = config.watchForFileChanges;
      const port = process.env.PORT ?? (isDev ? "5173" : "4173");
      const configOverrides: Partial<Cypress.PluginConfigOptions> = {
        baseUrl: `http://localhost:${port}`,
      };
      return { ...config, ...configOverrides };
    },
  },
});
