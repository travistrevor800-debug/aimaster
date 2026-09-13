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

// Frontend
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));

const loader = new ModuleLoader();

let bootPromise = null;
let routesMounted = false;

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
        loader.list().map((module) => module.name)
      );

      await loader.startAll();

      console.log("AI Master backend initialized successfully.");

      return true;
    } catch (error) {
      console.error("FATAL BOOT ERROR:", error);

      bootPromise = null;

      throw error;
    }
  })();

  return bootPromise;
}

// Health — deliberately independent of module boot
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "AI Master Backend",
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

// Initialize modules and mount their routes when an API request needs them
app.use(async (req, res, next) => {
  if (!req.path.startsWith("/api/")) {
    return next();
  }

  if (
    req.path === "/api/health" ||
    req.path === "/api"
  ) {
    return next();
  }

  try {
    await boot();

    if (!routesMounted) {
      loader.mountRoutes(app);
      routesMounted = true;
    }

    next();
  } catch (error) {
    console.error("API INITIALIZATION ERROR:", error);

    res.status(500).json({
      success: false,
      error: "AI Master backend failed to initialize.",
      message: error.message,
    });
  }
});

// Frontend fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

export default app;
