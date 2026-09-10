import express from "express";
import cors from "cors";
import ModuleLoader from "./moduleLoader.js";
const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
  })
);
app.use(express.json());
const loader = new ModuleLoader();
let bootPromise;
async function boot() {
  if (bootPromise) {
    return bootPromise;
  }
  bootPromise = (async () => {
    try {
      console.log("Starting AI Master backend...");
      await loader.load();
      console.log(
        "Modules discovered:",
        loader.list().map((m) => m.name)
      );
      await loader.startAll();
      loader.mountRoutes(app);
      app.get("/api/dashboard/nav", (req, res) => {
        res.json({
          modules: loader.getNavEntries(),
        });
      });
      app.get("/api/health", (req, res) => {
        res.json({
          status: "ok",
          modulesLoaded: loader.list().length,
          modules: loader.list().map((m) => m.name),
        });
      });
      app.get("/", (req, res) => {
        res.json({
          name: "AI Master Backend",
          status: "running",
          health: "/api/health",
        });
      });
      console.log("AI Master backend initialized successfully.");
      return app;
    } catch (error) {
      console.error("FATAL BOOT ERROR:", error);
      // Allow another invocation to retry initialization.
      bootPromise = null;
      throw error;
    }
  })();
  return bootPromise;
}
// Initialize the application.
await boot();
// Export the Express app for Vercel.
export default app;
