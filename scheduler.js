import * as youtube from "./youtube.js";
import * as x from "./x.js";
import * as instagram from "./instagram.js";
import * as tiktok from "./tiktok.js";
const connectors = {
  youtube,
  x,
  instagram,
  tiktok,
};
// Temporary in-memory queue.
// This should eventually be replaced with a persistent database/job queue
// because serverless deployments such as Vercel do not guarantee that
// in-memory data will survive between invocations.
const queue = [];
let nextId = 1;
export function schedulePost({
  platforms = [],
  content,
  scheduledFor,
}) {
  if (!Array.isArray(platforms) || platforms.length === 0) {
    throw new Error(
      "At least one platform is required"
    );
  }
  if (!content || typeof content !== "string") {
    throw new Error(
      "Post content is required"
    );
  }
  const unknownPlatforms = platforms.filter(
    (platform) => !connectors[platform]
  );
  if (unknownPlatforms.length > 0) {
    throw new Error(
      `Unknown platform(s): ${unknownPlatforms.join(", ")}`
    );
  }
  const scheduledDate = scheduledFor
    ? new Date(scheduledFor)
    : new Date();
  if (Number.isNaN(scheduledDate.getTime())) {
    throw new Error(
      "scheduledFor must be a valid date"
    );
  }
  const job = {
    id: nextId++,
    platforms: [...new Set(platforms)],
    content,
    scheduledFor: scheduledDate.toISOString(),
    status: "queued",
    results: {},
    createdAt: new Date().toISOString(),
  };
  queue.push(job);
  return job;
}
export function listQueue() {
  return queue;
}
/**
 * Publish all jobs that are due.
 *
 * Each platform gets its own result so one failed platform
 * does not incorrectly overwrite another platform's result.
 */
export async function processQueue() {
  const now = Date.now();
  const dueJobs = queue.filter((job) => {
    if (job.status !== "queued") {
      return false;
    }
    return (
      new Date(job.scheduledFor).getTime() <= now
    );
  });
  for (const job of dueJobs) {
    job.status = "processing";
    for (const platform of job.platforms) {
      const connector = connectors[platform];
      if (!connector) {
        job.results[platform] = {
          status: "failed",
          error: "Unknown platform",
        };
        continue;
      }
      if (typeof connector.post !== "function") {
        job.results[platform] = {
          status: "failed",
          error: "Connector does not support posting",
        };
        continue;
      }
      try {
        const result = await connector.post(
          job.content
        );
        job.results[platform] = {
          status: "posted",
          result: result || null,
        };
      } catch (error) {
        console.error(
          `[Scheduler] Failed to post job ${job.id} to ${platform}:`,
          error.message
        );
        job.results[platform] = {
          status: "failed",
          error: error.message,
        };
      }
    }
    const results = Object.values(job.results);
    const successful = results.filter(
      (result) => result.status === "posted"
    );
    const failed = results.filter(
      (result) => result.status === "failed"
    );
    if (successful.length === job.platforms.length) {
      job.status = "posted";
    } else if (failed.length === job.platforms.length) {
      job.status = "failed";
    } else {
      job.status = "partial";
    }
    job.processedAt = new Date().toISOString();
  }
  return dueJobs;
}
