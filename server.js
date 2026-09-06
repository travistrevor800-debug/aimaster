
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

const PORT = process.env.PORT || 4000;

const loader = new ModuleLoader();

async function boot() {
  try {
    console.log("Starting AI Master backend...");

    await loader.load();

    console.log("Modules discovered:", loader.list().map((m) => m.name));

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

    app.listen(PORT, () => {
      console.log("");
      console.log("=================================");
      console.log(" AI Master backend is running");
      console.log(` http://localhost:${PORT}`);
      console.log("=================================");
      console.log("");
    });
  } catch (error) {
    console.error("");
    console.error("=================================");
    console.error(" FATAL BOOT ERROR");
    console.error("=================================");
    console.error(error);
    console.error("");

    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  console.log("\nShutting down...");

  try {
    await loader.stopAll();
  } catch (error) {
    console.error("Shutdown error:", error);
  }

  process.exit(0);
});

boot();
