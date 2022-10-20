import ScrappingTargets from "../misc/targets.js"
import { NoLoadScrappingJob, SnapshotScrappingJob, OneSelectorScrappingJob } from "../components/checker.js"
import { IPayload, ITargetList } from "../types/misc.js"
import Logger from "../misc/logger.js";
import { HeroServer } from "./deps/shero.js";
import MessageFormatter from "../components/formatter.js";
import NotifyUser from "./sendmsg.js";
import Locals from "../misc/locals.js";


/**
 * Coordinator of the monitoring.
 */
export default class Handler {

    /**
     * All sources to monitor for PS5 products.
     */
    #_ps5_sources: {"noload_type": Array<ITargetList>;"snapshot_type": Array<ITargetList>; "onselector_type":Array<ITargetList>} | null

    /**
     * All sources to monitor for Jordan products.
     */
    #_jordans_sources: {"noload_type": Array<ITargetList>;"snapshot_type": Array<ITargetList>; "onselector_type":Array<ITargetList>} | null
    
    /**
     * Association list: source-type to scrapping-method
     */
    static jobs = {
        "noload_type": NoLoadScrappingJob,
        "snapshot_type": SnapshotScrappingJob,
        "onselector_type": OneSelectorScrappingJob
    }

    /**
     * Container of found new items to notify about.
     */
    #_new_found_items: Array<IPayload[] | null>

    /**
     * Monitoring session name.
     */
    #_session: string;

    /**
     * Logger.
     */
    #_logger: Logger;

    constructor() {
        this.#_ps5_sources = null
        this.#_jordans_sources = null
        this.#_session = `session-${Date.now()}`
        this.#_logger = new Logger(Handler.name, this.#_session)
        this.#_new_found_items = []
    }
    
    /**
     * Load targets
     */
    load() {
        const targets = ScrappingTargets.load()
        this.#_ps5_sources = targets["ps5_sources"]
        this.#_jordans_sources = targets["jordans_sources"]

        return this
    }

    /**
     * Check for products
     */
    async check() {

        // Launch the Hero server.
        await HeroServer.poke(this.#_session)

        // PS5 products
        const ps5_sources = Object.entries(this.#_ps5_sources!)
        if(ps5_sources.length !== 0) {
            for (const entry of ps5_sources){
                try {
                    this.#_new_found_items.push(
                        await new Handler.jobs[entry[0]! as keyof typeof Handler.jobs](entry[1], this.#_session).exec()
                    )
                } catch(error) {
                    this.#_logger.error(`${error}`)
                    continue
                }
            }
        }

        // Jordans products
        if(Object.entries(this.#_jordans_sources!).length !== 0) {
            // to fill later ...
        }

        // Shutdown the Hero server.
        await HeroServer.poke(this.#_session)

        return this
    }

    /**
     * Notify if there is something new
     */
    async notify() {
        
        this.#_logger.info(JSON.stringify(this.#_new_found_items, null, 2))

        const message = new MessageFormatter(this.#_new_found_items).render()

        let webhook = Locals.config().DiscordWebhook

        if (message && webhook) {
            await new NotifyUser(webhook, message, this.#_session).exec()
        } else {
            this.#_logger.error('Provide a valid Discord webhook.')
        }
    }
}