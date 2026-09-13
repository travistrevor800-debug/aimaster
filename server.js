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

// Serve frontend
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));

const loader = new ModuleLoader();

let bootPromise = null;

async function boot() {
  if (bootPromise) {
    return bootPromise;
  }

  bootPromise = (async () => {
    console.log("Starting AI Master backend...");

    try {
      await loader.load();

      console.log(
        "Modules discovered:",
        loader.list().map((module) => module.name)
      );

      await loader.startAll();

      loader.mountRoutes(app);

      console.log("AI Master backend initialized successfully.");

      return true;
    } catch (error) {
      console.error("BOOT ERROR:", error);

      // Allow a later invocation to retry.
      bootPromise = null;

      throw error;
    }
  })();

  return bootPromise;
}

/*
 * Basic health endpoint.
 * This responds without depending on module loading.
 */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "AI Master Backend",
    modulesLoaded: loader.list().length,
    modules: loader.list().map((module) => module.name),
  });
});

app.get("/api", (req, res) => {
  res.json({
    name: "AI Master Backend",
    status: "running",
    health: "/api/health",
    dashboard: "/",
  });
});

/*
 * Initialize modules before handling module API routes.
 */
app.use("/api", async (req, res, next) => {
  // Don't make basic endpoints depend on module boot.
  if (
    req.path === "/health" ||
    req.path === "/"
  ) {
    return next();
  }

  try {
    await boot();
    next();
  } catch (error) {
    console.error("MODULE BOOT FAILED:", error);

    res.status(500).json({
      success: false,
      error: "AI Master backend failed to initialize.",
      message: error.message,
    });
  }
});

/*
 * Mount module routes after boot.
 */
let routesMounted = false;

async function ensureRoutesMounted() {
  if (routesMounted) {
    return;
  }

  await boot();
  loader.mountRoutes(app);
  routesMounted = true;
}

/*
 * Catch module API requests and make sure routes exist.
 */
app.use(async (req, res, next) => {
  if (!req.path.startsWith("/api/")) {
    return next();
  }

  try {
    await ensureRoutesMounted();
    next();
  } catch (error) {
    console.error("ROUTE INITIALIZATION ERROR:", error);

    res.status(500).json({
      success: false,
      error: "Failed to initialize API routes.",
      message: error.message,
    });
  }
});

/*
 * Frontend fallback.
 */
app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

export default app;
