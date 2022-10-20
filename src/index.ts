import Handler from "./core/handler.js";

await (await new Handler().load().check()).notify();
