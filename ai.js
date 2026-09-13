import { Router } from "express";
import OpenAI from "openai";
import eventBus from "./eventBus.js";

export default {
  name: "AI Workspace",
  version: "0.4.0",
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
        // TEXT
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
        // IMAGE
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

          if (!imageCall?.result) {
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
        // AUDIO / TEXT TO SPEECH
        // =========================

        if (type === "audio") {
          const speech = await client.audio.speech.create({
            model: "gpt-4o-mini-tts",
            voice: "alloy",
            input: prompt,
            response_format: "mp3",
          });

          const audioBuffer = Buffer.from(
            await speech.arrayBuffer()
          );

          return res.json({
            success: true,
            type: "audio",
            content: `data:audio/mpeg;base64,${audioBuffer.toString(
              "base64"
            )}`,
          });
        }

        // =========================
        // VIDEO / SORA
        // =========================

        if (type === "video") {
          const video = await client.videos.create({
            model: "sora-2",
            prompt,
            seconds: "4",
            size: "1280x720",
          });

          return res.json({
            success: true,
            type: "video",
            status: video.status,
            videoId: video.id,
            progress: video.progress || 0,
            message:
              "Video generation started. Use the video status endpoint to check progress.",
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
          code: error?.code || null,
          status: error?.status || null,
        });
      }
    });

    // =========================
    // VIDEO STATUS
    // =========================

    router.get("/video/:videoId", async (req, res) => {
      try {
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

        const video = await client.videos.retrieve(
          req.params.videoId
        );

        let content = null;

        // If completed, obtain the video content.
        if (video.status === "completed") {
          const response =
            await client.videos.downloadContent(video.id);

          const buffer = Buffer.from(
            await response.arrayBuffer()
          );

          content = `data:video/mp4;base64,${buffer.toString(
            "base64"
          )}`;
        }

        return res.json({
          success: true,
          type: "video",
          videoId: video.id,
          status: video.status,
          progress: video.progress || 0,
          content,
          error: video.error || null,
        });

      } catch (error) {
        console.error(
          "[AI Workspace] Video status error:",
          error
        );

        return res.status(500).json({
          success: false,
          error: "Failed to retrieve video status",
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
      version: "0.4.0",
    });
  },
};
