// Placeholder in-memory store. Swap this out for the real database module
// (see backend/database/) once you wire up persistence.

const store = new Map();

const defaultMemory = () => ({
  preferredLanguages: [],
  learningProgress: {},
  favoriteContentTopics: [],
  savedProjects: [],
  productivitySettings: {},
});

export function getMemory(userId) {
  if (!store.has(userId)) {
    store.set(userId, defaultMemory());
  }
  return store.get(userId);
}

export function updateMemory(userId, partial) {
  const current = getMemory(userId);
  const updated = { ...current, ...partial };
  store.set(userId, updated);
  return updated;
}
