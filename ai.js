import { Router } from "express";
import OpenAI from "openai";
import eventBus from "./eventBus.js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default {
  name: "AI Workspace",

  version: "0.2.0",

  slug: "ai",

  navEntry: {
    icon: "🤖",
    label: "AI Workspace",
    path: "/ai",
  },

  routes() {
    const router = Router();

    router.post("/generate", async (req, res) => {
      try {
        const { prompt, type = "text" } = req.body;

        if (!prompt || typeof prompt !== "string") {
          return res.status(400).json({
            success: false,
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
            success: false,
            error: "Unsupported output type",
            supportedTypes,
          });
        }

        // TEXT GENERATION
        if (type === "text") {
          if (!process.env.OPENAI_API_KEY) {
            return res.status(503).json({
              success: false,
              error: "OPENAI_API_KEY is not configured.",
            });
          }

          const response = await client.responses.create({
            model: "gpt-5.6-luna",
            input: prompt,
          });

          return res.json({
            success: true,
            type: "text",
            content: response.output_text,
          });
        }

        // These engines will be connected separately.
        if (type === "audio") {
          return res.status(501).json({
            success: false,
            type: "audio",
            error: "Audio engine is the next integration.",
          });
        }

        if (type === "image") {
          return res.status(501).json({
            success: false,
            type: "image",
            error: "Image engine is the next integration.",
          });
        }

        if (type === "video") {
          return res.status(501).json({
            success: false,
            type: "video",
            error: "Video engine is the next integration.",
          });
        }

      } catch (error) {
        console.error(
          "[AI Workspace] Generation error:",
          error
        );

        return res.status(500).json({
          success: false,
          error: "AI generation failed",
          message: error.message,
        });
      }
    });

    return router;
  },

  async start() {
    console.log("AI Workspace module ready.");

    eventBus.emit("module:ready", {
      module: "ai",
      version: "0.2.0",
    });
  },
};
