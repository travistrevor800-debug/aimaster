import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class ModuleLoader {
  constructor(moduleFile = path.join(__dirname, "index.js")) {
    this.moduleFile = moduleFile;
    this.modules = [];
  }

  async load() {
    try {
      const imported = await import(
        pathToFileURL(this.moduleFile).href
      );

      const rootModule = imported.default;

      if (!rootModule) {
        throw new Error("No default module export found");
      }

      /*
       * The root module can now contain:
       *
       * modules: [module1, module2, module3]
       *
       * This lets AI Master grow into multiple modules.
       */

      if (Array.isArray(rootModule.modules)) {
        this.modules = rootModule.modules;
      } else {
        // Backward compatibility with the existing Social Sync module
        this.modules = [rootModule];
      }

      for (const mod of this.modules) {
        if (!mod || !mod.name) {
          throw new Error(
            "Invalid module: every module needs a name"
          );
        }

        console.log(
          `[ModuleLoader] Loaded module: ${mod.name} (v${
            mod.version || "0.0.0"
          })`
        );
      }

    } catch (error) {

      console.error(
        "[ModuleLoader] Failed to load modules:",
        error.message
      );

      throw error;
    }
  }

  async startAll() {

    for (const mod of this.modules) {

      try {

        if (typeof mod.start === "function") {
          await mod.start();
        }

      } catch (error) {

        console.error(
          `[ModuleLoader] Error starting "${mod.name}":`,
          error.message
        );

        throw error;
      }
    }
  }

  async stopAll() {

    for (const mod of this.modules) {

      try {

        if (typeof mod.stop === "function") {
          await mod.stop();
        }

      } catch (error) {

        console.error(
          `[ModuleLoader] Error stopping "${mod.name}":`,
          error.message
        );
      }
    }
  }

  mountRoutes(app) {

    for (const mod of this.modules) {

      if (typeof mod.routes !== "function") {
        continue;
      }

      try {

        const router = mod.routes();

        const slug =
          mod.slug ||
          mod.name
            .toLowerCase()
            .replace(/\s+/g, "-");

        const base = `/api/${slug}`;

        app.use(base, router);

        console.log(
          `[ModuleLoader] Mounted routes for "${mod.name}" at ${base}`
        );

      } catch (error) {

        console.error(
          `[ModuleLoader] Failed to mount routes for "${mod.name}":`,
          error.message
        );

        throw error;
      }
    }
  }

  getNavEntries() {

    return this.modules
      .filter((mod) => mod.navEntry)
      .map((mod) => mod.navEntry);
  }

  list() {
    return this.modules;
  }
}
