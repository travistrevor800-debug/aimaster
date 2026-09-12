import aiModule from "./ai.js";
import socialSync from "./socialSync.js";

export default {
  name: "AI Master",
  version: "0.2.0",

  modules: [
    socialSync,
    aiModule,
  ],
};
