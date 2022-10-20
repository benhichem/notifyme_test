// Dependency imports
import Hero from "@ulixee/hero";
import fs from "fs";

// Utility imports.
import Logger from "../misc/logger.js";

// Type imports.
import { IPayload, ITargetList } from "../types/misc.js";
import { HeroServer } from "../core/deps/shero.js";
import Snapshot from "../misc/snapshot.js";

/**
 * Scrapper for the websites that will not show nothing if the product is not up.
 */
export class NoLoadScrappingJob {

    /**
     * Logger.
     */
    #_logger: Logger 

    /**
     * Hero client instance.
     */
  #_client: Hero | null;

    /**
     * List of websites to check.
     */
  #_sources: ITargetList[];

    /**
     * Result of the check.
     */
  #_payload: Array<IPayload> | null;

  constructor(sources: ITargetList[], session: string) {
    this.#_logger = new Logger(NoLoadScrappingJob.name, session)
    this.#_sources = sources;
    this.#_client = null;
    this.#_payload = null;
  }

  private async _setup() {

    this.#_client = new Hero({
      connectionToCore: {
        host: `ws://localhost:${HeroServer.port}`,
      },
    });

    this.#_client.on("close", () => {
        // ...
    });
  }

  private async _check() {
    for (var i = 0; i < this.#_sources.length; i++) {

        this.#_logger.info(`Navigating to ${this.#_sources[i].website}`)
      this.#_client?.goto(this.#_sources[i].website);
      await this.#_client!.waitForLoad("DomContentLoaded");

      let pannel = await this.#_client!.document.querySelector(
        this.#_sources[i].selector
      );
      if (pannel === null) {
        this.#_payload = []
        this.#_payload!.push({website: this.#_sources[i].website});
        this.#_logger.info(`Item released on ${this.#_sources[i].website}.`)
        
      } else {
        this.#_logger.info(`Item not yet on ${this.#_sources[i].website}.`)
      }
    }
  }

  private async _cleanup() {
    await this.#_client!.close()
  }

  public async exec() {
    await this._setup();
    if (this.#_client !== null) {

      await this._check();
      await this._cleanup()
      return this.#_payload;
    } else {
      this.#_logger.error('Hero session failed.')
      await this._cleanup()
      return this.#_payload;
    }
  }
}

/**
 * Scrapper for the websites that need a snapshot system to know if there is anything new.
 */
export class SnapshotScrappingJob {

  /**
   * Logger
   */
  #_logger: Logger;

  /**
   * Hero client.
   */
  #_client: Hero | null;

  /**
   * Scrapping result.
   */
    #_payload: IPayload[] | null;
  /**
   * Target to scrape.
   */
  #_sources: ITargetList[];

  /**
   * Temporary Holder for the new data
   */
  #_temp: {source:string; name: string; url: string;}[];


  constructor(sources: ITargetList[], session: string) {
    this.#_logger = new Logger(SnapshotScrappingJob.name, session);
    this.#_client = null;
    this.#_sources = sources
    this.#_payload = null
    this.#_temp = [];
  }

  private async _setup() {
    this.#_client = new Hero({
      connectionToCore: {
        host: `ws://localhost:${HeroServer.port}`,
      },
    });

    this.#_client.on("close", () => {
        // ...
    });

    return this;
  }


  private async _cleanup() {
    await this.#_client!.close();
  }

  private async _scrape() {
    for(const source of this.#_sources){

        this.#_logger.info(`Navigating to ${source.website}`)
        await this.#_client!.goto(source.website);
        await this.#_client!.waitForLoad("AllContentLoaded");


        let H2 = await this.#_client!.document.querySelectorAll(
            source.selector
        ).$map(async (item) => {
            this.#_temp.push({
                source: source.website,
                name: await item.innerText,
                url: await item.querySelector("a").href,
            });
        });

        // Filter according to keywords
        this.#_temp = this.#_temp.filter(item => {
            return source.keywords?.reduce((a, b)=>{
                return a || item.name.toLowerCase().includes(b)
            }, false)
        })

        this.#_logger.info(`[+] ${this.#_temp.length} items collected.`);
    }

  }

  public async exec() {
    await this._setup();

    if (this.#_client !== null) {
      try {

        await this._scrape();

        // Check if this a first run
        if(fs.existsSync("../temp/snap.json")) {
            const new_items = new Snapshot(this.#_temp, this.#_logger).compare() || null

            if(new_items){
                this.#_payload = []
                this.#_sources.map((source)=>{ return source.website }).forEach((source)=>{
                    const items = new_items
                        .filter(item=>item.source===source)
                        .map(item=>{
                            return {
                                name: item.name,
                                url: item.url
                            }
                        })
                    this.#_payload!.push({
                        website: source,
                        item: items
                    })
                })
            } 
        } else {
            new Snapshot(this.#_temp, this.#_logger).take()
        }

      } catch (error) {

        this.#_logger.error(`[-] ${error}`);
      }

      await this._cleanup()
      return this.#_payload;
    } else {

      await this._cleanup()
      this.#_logger.error(`Hero sesssion failed.`);
      return this.#_payload;
    }

  }
}



/**
 * Scrapper for the websites where we have to check just one selector
 */


export class OneSelectorScrappingJob {

    /**
     * Hero client.
     */
    #_client: Hero | null;

    /**
     * Targets to scrape
     */
    #_sources: ITargetList[]

    /**
     * Logger
     */
    #_logger: Logger;

    /**
     * Scrapping result.
     */
    #_payload: IPayload[] | null;

  constructor(sources: ITargetList[], session: string) {

    this.#_client = null;
    this.#_logger = new Logger(OneSelectorScrappingJob.name, session);
    this.#_sources = sources
    this.#_payload = null;

  }

  private async _setup() {
    this.#_client = new Hero({
      connectionToCore: {
        host: `ws://localhost:${HeroServer.port}`,
      },
    });

    this.#_client.on("close", () => {
        // ...
    });
  }

  private async _cleanup() {
    this.#_client!.close();
  }

  private async _check() {
    for (const source of this.#_sources) {

        this.#_logger.info(`Navigating to ${source.website}`)
        await this.#_client!.goto(source.website);
        await this.#_client!.waitForLoad("PaintingStable");
        await this.#_client!.waitForMillis(15000);

        let t = await this.#_client!.document.querySelector(
            source.selector
        );

        if (t !== null) {
            let innerText = await t.innerText;
            if (innerText === "This product is no longer available") {
                this.#_logger.info(`Item is not yet available in ${source.website}!`);
                this.#_payload = null;
            } else {
                this.#_payload = []
                this.#_logger.info(`[+] found the item in ${this.#_logger}`);
                this.#_payload.push({
                    website: source.website
                })
            }
        } else {
            this.#_logger.error('Failed to grab the selector.')
            this.#_payload = null;
        }

        }
  }

  public async exec() {
    
    await this._setup();

    if (this.#_client !== null) {

      let t = await this._check();

      await this._cleanup();
      return this.#_payload;
    } else {
      this.#_logger.error("[-] Hero Failed To lunch");
      await this._cleanup();
      return this.#_payload;
    }
  }
}
