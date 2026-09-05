import * as youtube from "./connectors/youtube.js";
import * as x from "./connectors/x.js";
import * as instagram from "./connectors/instagram.js";
import * as tiktok from "./connectors/tiktok.js";

const connectors = { youtube, x, instagram, tiktok };

// Placeholder in-memory queue. Swap for a real DB-backed queue (or a job
// runner like BullMQ) once you have persistence and need retries/backoff.
const queue = [];
let nextId = 1;

export function schedulePost({ platforms = [], content, scheduledFor }) {
  const job = {
    id: nextId++,
    platforms,
    content,
    scheduledFor: scheduledFor || new Date().toISOString(),
    status: "queued",
  };
  queue.push(job);
  return job;
}

export function listQueue() {
  return queue;
}

/** Call this from a cron/interval to actually publish due jobs. */
export async function processQueue() {
  const now = Date.now();
  const due = queue.filter((j) => j.status === "queued" && new Date(j.scheduledFor).getTime() <= now);

  for (const job of due) {
    for (const platform of job.platforms) {
      const connector = connectors[platform];
      if (!connector) {
        console.error(`[Scheduler] Unknown platform "${platform}" for job ${job.id}`);
        continue;
      }
      try {
        await connector.post(job.content);
        job.status = "posted";
      } catch (err) {
        console.error(`[Scheduler] Failed to post job ${job.id} to ${platform}:`, err.message);
        job.status = "failed";
      }
    }
  }
}
