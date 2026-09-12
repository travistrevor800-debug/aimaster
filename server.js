import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import ModuleLoader from "./moduleLoader.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
  })
);

app.use(express.json());

// Serve AI Master frontend
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));

const loader = new ModuleLoader();

let bootPromise;

async function boot() {
  if (bootPromise) return bootPromise;

  bootPromise = (async () => {
    try {
      console.log("Starting AI Master backend...");

      await loader.load();

      console.log(
        "Modules discovered:",
        loader.list().map((module) => module.name)
      );

      await loader.startAll();

      loader.mountRoutes(app);

      // Dashboard navigation
      app.get("/api/dashboard/nav", (req, res) => {
        res.json({
          modules: loader.getNavEntries(),
        });
      });

      // Health check
      app.get("/api/health", (req, res) => {
        res.json({
          status: "ok",
          modulesLoaded: loader.list().length,
          modules: loader.list().map((module) => module.name),
        });
      });

      // API information
      app.get("/api", (req, res) => {
        res.json({
          name: "AI Master Backend",
          status: "running",
          health: "/api/health",
          dashboard: "/",
        });
      });

      console.log("AI Master backend initialized successfully.");

      return app;
    } catch (error) {
      console.error("FATAL BOOT ERROR:", error);

      bootPromise = null;

      throw error;
    }
  })();

  return bootPromise;
}

await boot();

export default app;
