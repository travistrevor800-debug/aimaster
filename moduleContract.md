# Module Contract

Every module in `/modules/<name>/index.js` must have a default export shaped like this:

```js
import { Router } from "express";

export default {
  // Required
  name: "Creator Studio",
  version: "1.0.0",
  slug: "creator-studio",       // used to build the API base path: /api/creator-studio

  // Optional but recommended
  navEntry: {
    icon: "🎬",
    label: "Creator Studio",
    path: "/creator-studio",
  },

  // Optional: mount an Express router at /api/<slug>
  routes() {
    const router = Router();
    router.get("/", (req, res) => res.json({ status: "ok" }));
    return router;
  },

  // Optional lifecycle hooks
  async start() {
    // runs once when the app boots and the module is loaded
  },
  async stop() {
    // runs on graceful shutdown / hot-reload
  },
};
```

## Rules
- `name` and `version` are required. Everything else is optional.
- A module with no `routes()` is loaded but exposes no API - useful for
  background-only modules.
- Throwing inside `index.js` at import time will cause ModuleLoader to skip
  that module and log the error - it will NOT crash the app.
- Keep modules self-contained. Cross-module communication should go through
  `core/eventBus.js`, not direct imports between module folders.
