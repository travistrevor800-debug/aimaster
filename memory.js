// Temporary in-memory memory store.
//
// IMPORTANT:
// This store is not persistent. On Vercel, data may be lost when a
// serverless instance is restarted or a different instance handles
// the next request.
//
// Replace this implementation with a persistent database before
// relying on memory for production users.
const store = new Map();
function createDefaultMemory() {
  return {
    preferredLanguages: [],
    learningProgress: {},
    favoriteContentTopics: [],
    savedProjects: [],
    productivitySettings: {},
  };
}
function validateUserId(userId) {
  if (
    userId === undefined ||
    userId === null ||
    String(userId).trim() === ""
  ) {
    throw new Error("userId is required");
  }
}
export function getMemory(userId) {
  validateUserId(userId);
  const key = String(userId);
  if (!store.has(key)) {
    store.set(key, createDefaultMemory());
  }
  return store.get(key);
}
export function updateMemory(userId, partial = {}) {
  validateUserId(userId);
  if (
    typeof partial !== "object" ||
    partial === null ||
    Array.isArray(partial)
  ) {
    throw new Error(
      "Memory updates must be provided as an object"
    );
  }
  const key = String(userId);
  const current = getMemory(key);
  const updated = {
    ...current,
    ...partial,
  };
  store.set(key, updated);
  return updated;
}
export function clearMemory(userId) {
  validateUserId(userId);
  store.delete(String(userId));
}
export function hasMemory(userId) {
  validateUserId(userId);
  return store.has(String(userId));
}

