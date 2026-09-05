import { Router } from "express";
import eventBus from "../../core/eventBus.js";
import * as youtube from "./connectors/youtube.js";
import * as x from "./connectors/x.js";
import * as instagram from "./connectors/instagram.js";
import * as tiktok from "./connectors/tiktok.js";
import { schedulePost, listQueue } from "./scheduler.js";

const connectors = { youtube, x, instagram, tiktok };

export default {
  name: "Social Sync",
  version: "0.1.0",
  slug: "social-sync",
  navEntry: { icon: "📡", label: "Social Sync", path: "/social-sync" },

  routes() {
    const router = Router();

    // Kick off OAuth for a given platform
    router.get("/connect/:platform", (req, res) => {
      const connector = connectors[req.params.platform];
      if (!connector) return res.status(404).json({ error: "Unknown platform" });
      res.json({ authUrl: connector.getAuthUrl ? connector.getAuthUrl() : "TODO: implement getAuthUrl()" });
    });

    // Pull whatever trend signal is available per platform
    router.get("/trends/:platform", async (req, res) => {
      const connector = connectors[req.params.platform];
      if (!connector) return res.status(404).json({ error: "Unknown platform" });
      const trends = await connector.getTrends();
      res.json({ trends });
    });

    // Queue a post for one or more platforms
    router.post("/post", (req, res) => {
      const { platforms, content, scheduledFor } = req.body;
      const job = schedulePost({ platforms, content, scheduledFor });
      res.json({ queued: job });
    });

    router.get("/queue", (req, res) => {
      res.json({ queue: listQueue() });
    });

    return router;
  },

  async start() {
    console.log("Social Sync module ready (connectors are stubs - see connectors/*.js).");
    // Example: poll for trends periodically and broadcast them on the event bus
    // so Creator Studio can react. Left commented out until connectors are wired
    // to real credentials, to avoid firing bogus events.
    //
    // setInterval(async () => {
    //   const trends = await youtube.getTrends();
    //   trends.forEach((t) => eventBus.emit("trend:detected", t));
    // }, 1000 * 60 * 30);
  },
};
