import { Router } from "express";
import OpenAI from "openai";
import eventBus from "./eventBus.js";

export default {
  name: "AI Workspace",
  version: "0.3.0",
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

        // =========================
        // VALIDATION
        // =========================
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

        // =========================
        // API KEY
        // =========================
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
          return res.status(503).json({
            success: false,
            error: "OPENAI_API_KEY is not configured on Vercel.",
          });
        }

        const client = new OpenAI({
          apiKey,
        });

        // =========================
        // TEXT GENERATION
        // =========================
        if (type === "text") {
          const response = await client.responses.create({
            model: "gpt-5.6-luna",
            input: prompt,
          });

          return res.json({
            success: true,
            type: "text",
            content: response.output_text || "",
          });
        }

        // =========================
        // IMAGE GENERATION
        // =========================
        if (type === "image") {
          const response = await client.responses.create({
            model: "gpt-5.6-luna",
            input: prompt,
            tools: [
              {
                type: "image_generation",
              },
            ],
          });

          const imageCall = response.output?.find(
            (item) => item.type === "image_generation_call"
          );

          if (!imageCall || !imageCall.result) {
            return res.status(500).json({
              success: false,
              type: "image",
              error: "Image generation returned no image.",
            });
          }

          return res.json({
            success: true,
            type: "image",
            content: `data:image/png;base64,${imageCall.result}`,
          });
        }

        // =========================
        // AUDIO
        // =========================
        if (type === "audio") {
          return res.status(501).json({
            success: false,
            type: "audio",
            error: "Audio engine is not connected yet.",
          });
        }

        // =========================
        // VIDEO
        // =========================
        if (type === "video") {
          return res.status(501).json({
            success: false,
            type: "video",
            error: "Video engine is not connected yet.",
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
          message: error?.message || "Unknown error",
        });
      }
    });

    return router;
  },

  async start() {
    console.log("AI Workspace module ready.");

    eventBus.emit("module:ready", {
      module: "ai",
      version: "0.3.0",
    });
  },
};
