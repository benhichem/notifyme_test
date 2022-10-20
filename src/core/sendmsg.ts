import axios from "axios";
import Logger from "../misc/logger.js";
import { IDiscordMsg } from "../types/discord";

/**
 * A class to consume the Discord Webhook
 */
export default class NotifyUser {

  /**
   * A webhook URL provided by the discord channel.
   */
  private URL: string;

  /**
   * Message to send through the webhook
   */
  public msg: IDiscordMsg;

  /**
   * Logger.
   */
  #logger: Logger;


  constructor(webhookurl: string, msg: IDiscordMsg, session: string) {
    this.URL = webhookurl;
    this.msg = msg;
    this.#logger = new Logger(NotifyUser.name, session);
  }

  async exec() {

    this.#logger.info(`Sending msg to ${this.URL}`);
  
    try {

      let send_msg = await axios.post(this.URL, this.msg, {
        headers: { "content-type": "application/json" },
      });

      this.#logger.info("Message successfully sent.");
    } catch (error) {

      this.#logger.error(`Failed to send message. Error: ${error}`);
    }
  }
}
