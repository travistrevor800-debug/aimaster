import { EventEmitter } from "events";
/**
 * Shared event bus for communication between modules.
 *
 * Example:
 *
 *   import eventBus from "./eventBus.js";
 *
 *   eventBus.emit("trend:detected", {
 *     platform: "youtube",
 *     topic: "...",
 *   });
 *
 *   eventBus.on("trend:detected", (payload) => {
 *     console.log(payload);
 *   });
 */
class AppEventBus extends EventEmitter {}
const eventBus = new AppEventBus();
// Allow multiple modules to listen for events without
// triggering EventEmitter's default listener warning.
eventBus.setMaxListeners(50);
export default eventBus;
