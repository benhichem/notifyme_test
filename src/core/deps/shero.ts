import Server from "@ulixee/server";
import Logger from "../../misc/logger.js";
import Locals from "../../misc/locals.js";

/**
 * Singleton Class
 */
export class HeroServer {
  private static _logger: Logger = new Logger("Hero Server", "hero-server");

  private static instance: HeroServer | null = null;
  private _config: HeroServerConfig;
  private _server: Server;
  private static _clients: Array<string> = [];

  private constructor() {
    this._server = new Server();
    this._config = {
      PORT: Number(Locals.config().HeroServerPORT) || 3333,
    };

    return this;
  }

  static get port(): number {
    return this.instance?._config.PORT || 3333;
  }

  private async _launch() {
    await this._server.listen({ port: this._config.PORT });
    HeroServer.instance = this;
    HeroServer._logger.info(`Server launched at PORT : ${this._config.PORT}`);

    return this;
  }

  private async _kill() {
    HeroServer._logger.warn("Server going down ...");
    await this._server.close();
    HeroServer.instance = null;
  }

  static async poke(_client: any): Promise<HeroServer | null | undefined> {
    /**
     * @description this a typical example of 'do a flip'.
     */

    if (HeroServer._clients.includes(_client)) {
      HeroServer._clients = HeroServer._clients.filter(
        (client) => client !== _client
      );
      HeroServer._logger.info(`Client #${_client} logged off.`);
      HeroServer._logger.info(`Client pools [${HeroServer._clients}]`);
      if (HeroServer._clients.length === 0 && HeroServer.instance !== null) {
        HeroServer._logger.info("All connections terminated.");
        await HeroServer.instance?._kill();
        return HeroServer.instance;
      }
    } else {
      if (HeroServer.instance === null) {
        HeroServer._clients.push(_client);
        HeroServer._logger.info(`A new client logged #${_client}`);
        HeroServer._logger.info(`Clients pool [${HeroServer._clients}]`);
        return await new HeroServer()._launch();
      } else {
        if (!HeroServer._clients.includes(_client))
          HeroServer._clients.push(_client);
        HeroServer._logger.info(
          `Server found at PORT : ${HeroServer.instance._config.PORT}`
        );
        return HeroServer.instance;
      }
    }
  }
}

type HeroServerConfig = {
  PORT: number;
};
