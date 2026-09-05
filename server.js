import express from "express";
import cors from "cors";
import ModuleLoader from "./core/moduleLoader.js";

const app = express();

// Allow your frontend's origin once deployed - set FRONTEND_URL in your env vars.
// Falls back to allowing all origins during local development.
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

const PORT = process.env.PORT || 4000;
const loader = new ModuleLoader();

async function boot() {
  await loader.load();
  await loader.startAll();
  loader.mountRoutes(app);

  // Dashboard nav is built from whatever modules successfully loaded
  app.get("/api/dashboard/nav", (req, res) => {
    res.json({ modules: loader.getNavEntries() });
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", modulesLoaded: loader.list().length });
  });

  app.listen(PORT, () => {
    console.log(`\nAI Master backend running on http://localhost:${PORT}`);
    console.log(`Modules loaded: ${loader.list().map((m) => m.name).join(", ")}\n`);
  });
}

process.on("SIGINT", async () => {
  console.log("\nShutting down...");
  await loader.stopAll();
  process.exit(0);
});

boot().catch((err) => {
  console.error("Fatal error during boot:", err);
  process.exit(1);
});
