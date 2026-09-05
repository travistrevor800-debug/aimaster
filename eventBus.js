import { EventEmitter } from "events";

/**
 * Shared event bus so modules can talk to each other without
 * importing one another directly (keeps modules decoupled/installable).
 *
 * Example:
 *   import eventBus from "../../core/eventBus.js";
 *   eventBus.emit("trend:detected", { platform: "youtube", topic: "..." });
 *   eventBus.on("trend:detected", (payload) => { ... });
 */
class AppEventBus extends EventEmitter {}

const eventBus = new AppEventBus();
eventBus.setMaxListeners(50);

export default eventBus;
