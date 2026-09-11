import { Router } from "express";
import eventBus from "./eventBus.js";
import * as youtube from "./youtube.js";
import * as x from "./x.js";
import * as instagram from "./instagram.js";
import * as tiktok from "./tiktok.js";
import { schedulePost, listQueue } from "./scheduler.js";
const connectors = {
  youtube,
  x,
  instagram,
  tiktok,
};
export default {
  name: "Social Sync",
  version: "0.1.0",
  slug: "social-sync",
  navEntry: {
    icon: "📡",
    label: "Social Sync",
    path: "/social-sync",
  },
  routes() {
    const router = Router();
    // Start OAuth connection for a platform
    router.get("/connect/:platform", (req, res) => {
      const connector = connectors[req.params.platform];
      if (!connector) {
        return res.status(404).json({
          error: "Unknown platform",
        });
      }
      const authUrl =
        typeof connector.getAuthUrl === "function"
          ? connector.getAuthUrl()
          : null;
      res.json({
        platform: req.params.platform,
        authUrl,
      });
    });
    // Get trends for a platform
    router.get("/trends/:platform", async (req, res) => {
      const connector = connectors[req.params.platform];
      if (!connector) {
        return res.status(404).json({
          error: "Unknown platform",
        });
      }
      try {
        const trends =
          typeof connector.getTrends === "function"
            ? await connector.getTrends()
            : [];
        res.json({
          platform: req.params.platform,
          trends,
        });
      } catch (error) {
        console.error(
          `[Social Sync] Failed to get trends for ${req.params.platform}:`,
          error.message
        );
        res.status(500).json({
          error: "Failed to retrieve trends",
          message: error.message,
        });
      }
    });
    // Queue a post for one or more platforms
    router.post("/post", (req, res) => {
      const { platforms, content, scheduledFor } = req.body;
      if (!Array.isArray(platforms) || platforms.length === 0) {
        return res.status(400).json({
          error: "platforms must be a non-empty array",
        });
      }
      if (!content || typeof content !== "string") {
        return res.status(400).json({
          error: "content is required",
        });
      }
      try {
        const job = schedulePost({
          platforms,
          content,
          scheduledFor,
        });
        res.status(201).json({
          queued: job,
        });
      } catch (error) {
        console.error(
          "[Social Sync] Failed to queue post:",
          error.message
        );
        res.status(500).json({
          error: "Failed to queue post",
          message: error.message,
        });
      }
    });
    // View queued posts
    router.get("/queue", (req, res) => {
      res.json({
        queue: listQueue(),
      });
    });
    return router;
  },
  async start() {
    console.log(
      "Social Sync module ready. Connectors are currently stubs."
    );
    eventBus.emit("module:ready", {
      module: "social-sync",
      version: "0.1.0",
    });
  },
};
