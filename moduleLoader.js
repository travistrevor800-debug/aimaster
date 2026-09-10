import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * ModuleLoader
 *
 * Loads feature modules from the repository root.
 *
 * Supported module files:
 * - youtube.js
 * - instagram.js
 * - tiktok.js
 * - x.js
 *
 * A broken module will be skipped instead of crashing
 * the entire application.
 */
export default class ModuleLoader {
  constructor(folder = __dirname) {
    this.folder = folder;
    this.modules = [];
  }
  async load() {
    if (!fs.existsSync(this.folder)) {
      console.warn(`[ModuleLoader] Folder not found: ${this.folder}`);
      return;
    }
    const moduleFiles = [
      "youtube.js",
      "instagram.js",
      "tiktok.js",
      "x.js",
    ];
    for (const fileName of moduleFiles) {
      const modulePath = path.join(this.folder, fileName);
      if (!fs.existsSync(modulePath)) {
        console.warn(
          `[ModuleLoader] Skipping "${fileName}" - file not found`
        );
        continue;
      }
      try {
        const imported = await import(pathToFileURL(modulePath).href);
        const mod = imported.default;
        if (!mod || !mod.name) {
          console.warn(
            `[ModuleLoader] Skipping "${fileName}" - invalid module export`
          );
          continue;
        }
        this.modules.push(mod);
        console.log(
          `[ModuleLoader] Loaded module: ${mod.name} (v${
            mod.version || "0.0.0"
          })`
        );
      } catch (err) {
        console.error(
          `[ModuleLoader] Failed to load "${fileName}":`,
          err.message
        );
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
        console.error(
          `[ModuleLoader] Error starting "${mod.name}":`,
          err.message
        );
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
        console.error(
          `[ModuleLoader] Error stopping "${mod.name}":`,
          err.message
        );
      }
    }
  }
  mountRoutes(app) {
    for (const mod of this.modules) {
      if (typeof mod.routes === "function") {
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
        } catch (err) {
          console.error(
            `[ModuleLoader] Failed to mount routes for "${mod.name}":`,
            err.message
          );
        }
      }
    }
  }
  getNavEntries() {
    return this.modules
      .filter((m) => m.navEntry)
      .map((m) => m.navEntry);
  }
  list() {
    return this.modules;
  }
}
