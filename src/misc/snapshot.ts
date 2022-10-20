import fs from "fs"
import Lodash from "lodash";
import Logger from "./logger";

export default class Snapshot {
    /**
     * Logger
     */
    #_logger: Logger;
    #_latest_snapshot: {source:string; name: string; url: string;}[] | null;
    #_current_snapshot: {source:string; name: string; url: string; }[];

    constructor(snapshot:{source:string; name: string; url: string;}[] ,logger: Logger){
        this.#_logger = logger
        this.#_current_snapshot = snapshot
        this.#_latest_snapshot = null

    }

    /**
     * Takes a new snapshot.
     */
    take() {
        fs.writeFileSync("../temp/snap.json", JSON.stringify(this.#_current_snapshot, null, 2));
    }

    /**
     * Load latest snapshot
     */
    load() {

        this.#_logger.info("Loading old snpashot of the website");
        let oldSnap = fs.readFileSync("../temp/snap.json");
        this.#_latest_snapshot = JSON.parse(oldSnap.toString());
    }

    /**
     * Compares the old and the new snapshot then yield the difference.
     */
    compare() {

            this.load()
            this.#_logger.info("Comparing snapshots ...");

            const res = Lodash.differenceBy(this.#_current_snapshot, this.#_latest_snapshot!, "name");
            if (res.length > 0 && this.#_latest_snapshot!.length!==0) {
                this.#_logger.info(`Found new items!`);
                this.take()
                return res
            } else {
                this.#_logger.info("No new items.");
                return null
            }

    }
}