import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const modulesDir = path.join(__dirname, ".");

/**
 * ModuleLoader
 * Dynamically discovers and loads feature modules from the /modules folder.
 * Each module folder must contain an index.js with a default export
 * implementing the module contract (see core/moduleContract.js).
 *
 * A single broken module will NOT crash the app - it is skipped and logged.
 */
export default class ModuleLoader {
  constructor(folder = path.join(__dirname, "../modules")) {
    this.folder = folder;
    this.modules = [];
  }

  async load() {
    if (!fs.existsSync(this.folder)) {
      console.warn(`[ModuleLoader] Modules folder not found: ${this.folder}`);
      return;
    }

    const entries = fs.readdirSync(this.folder, { withFileTypes: true });
    const folders = entries.filter((e) => e.isDirectory()).map((e) => e.name);

    for (const folderName of folders) {
      const modulePath = path.join(this.folder, folderName, "index.js");

      if (!fs.existsSync(modulePath)) {
        console.warn(`[ModuleLoader] Skipping "${folderName}" - no index.js found`);
        continue;
      }

      try {
        const imported = await import(pathToFileURL(modulePath).href);
        const mod = imported.default;

        if (!mod || !mod.name) {
          console.warn(`[ModuleLoader] Skipping "${folderName}" - invalid module export`);
          continue;
        }

        this.modules.push(mod);
        console.log(`[ModuleLoader] Loaded module: ${mod.name} (v${mod.version || "0.0.0"})`);
      } catch (err) {
        console.error(`[ModuleLoader] Failed to load "${folderName}":`, err.message);
      }
    }
  }

  async startAll() {
    for (const mod of this.modules) {
      try {
        if (typeof mod.start === "function") {
          await mod.start();
        }
      } catch (err) {
        console.error(`[ModuleLoader] Error starting "${mod.name}":`, err.message);
      }
    }
  }

  async stopAll() {
    for (const mod of this.modules) {
      try {
        if (typeof mod.stop === "function") {
          await mod.stop();
        }
      } catch (err) {
        console.error(`[ModuleLoader] Error stopping "${mod.name}":`, err.message);
      }
    }
  }

  /** Mount every module's routes onto the given Express router/app */
  mountRoutes(app) {
    for (const mod of this.modules) {
      if (typeof mod.routes === "function") {
        try {
          const router = mod.routes();
          const base = `/api/${mod.slug || mod.name.toLowerCase().replace(/\s+/g, "-")}`;
          app.use(base, router);
          console.log(`[ModuleLoader] Mounted routes for "${mod.name}" at ${base}`);
        } catch (err) {
          console.error(`[ModuleLoader] Failed to mount routes for "${mod.name}":`, err.message);
        }
      }
    }
  }

  /** Get nav entries for the dashboard, in module-declared order */
  getNavEntries() {
    return this.modules
      .filter((m) => m.navEntry)
      .map((m) => m.navEntry);
  }

  list() {
    return this.modules;
  }
}
