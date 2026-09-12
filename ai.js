import { Router } from "express";
import eventBus from "./eventBus.js";

export default {
  name: "AI Workspace",

  version: "0.1.0",

  slug: "ai",

  navEntry: {
    icon: "🤖",
    label: "AI Workspace",
    path: "/ai",
  },

  routes() {

    const router = Router();

    /*
     * Main AI generation endpoint
     *
     * POST /api/ai/generate
     *
     * Body:
     * {
     *   "prompt": "Create a motivational message",
     *   "type": "text"
     * }
     */

    router.post("/generate", async (req, res) => {

      try {

        const { prompt, type = "text" } = req.body;

        if (!prompt || typeof prompt !== "string") {

          return res.status(400).json({
            error: "prompt is required",
          });

        }

        const supportedTypes = [
          "text",
          "audio",
          "video",
          "image",
        ];

        if (!supportedTypes.includes(type)) {

          return res.status(400).json({
            error: "Unsupported output type",
            supportedTypes,
          });

        }

        /*
         * Temporary AI engine.
         *
         * We will connect the real AI provider here next.
         */

        if (type === "text") {

          return res.json({
            success: true,
            type: "text",
            content:
              `AI Master received your request: ${prompt}`,
          });

        }

        if (type === "audio") {

          return res.status(501).json({
            success: false,
            type: "audio",
            error: "Audio engine is not connected yet.",
          });

        }

        if (type === "video") {

          return res.status(501).json({
            success: false,
            type: "video",
            error: "Video engine is not connected yet.",
          });

        }

        if (type === "image") {

          return res.status(501).json({
            success: false,
            type: "image",
            error: "Image engine is not connected yet.",
          });

        }

      } catch (error) {

        console.error(
          "[AI Workspace] Generation error:",
          error
        );

        res.status(500).json({
          success: false,
          error: "AI generation failed",
          message: error.message,
        });
      }
    });

    return router;
  },

  async start() {

    console.log(
      "AI Workspace module ready."
    );

    eventBus.emit("module:ready", {
      module: "ai",
      version: "0.1.0",
    });
  },
};
