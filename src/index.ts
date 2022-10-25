import Handler from "./core/handler.js";
import schedual from "node-schedule";

const Time_config = new schedual.RecurrenceRule();

Time_config.dayOfWeek = [0, new schedual.Range(0, 6)];
Time_config.hour = [0, new schedual.Range(0, 23)];
Time_config.minute = 30;

var Job = schedual.scheduleJob(Time_config, async () => {
  await (await new Handler().load().check()).notify();
});
