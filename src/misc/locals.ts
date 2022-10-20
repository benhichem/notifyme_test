/** @format */

import { ILocals } from "../types/misc.js";
import dotenv from "dotenv";
import path from "path";

export default class Locals {
  public static config(){
    dotenv.config({ path: "../.env" });

    const HeroServerPORT = parseInt(process.env.HERO_SERVER_PORT!) || 6806
    const DiscordWebhook = process.env.DISCORD_WEBHOOK || null
    const PeriodCheckInMinutes= parseInt(process.env.PERIOD_CHECK_IN_MINUTES!) % 60 || 30

    return {
      HeroServerPORT,
      DiscordWebhook,
      PeriodCheckInMinutes
    };
  }
}
