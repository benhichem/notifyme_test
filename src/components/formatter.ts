import { IPayload } from "../types/misc.js";
import { IDiscordMsg } from "../types/discord.js";

export default class MessageFormatter {

    /**
     * Embed to send through the webhook
     */
    #_message: IDiscordMsg
    #_content: (IPayload[] | null)[];

    constructor(content: Array<IPayload[] | null>){

        this.#_content = content
        this.#_message = {
            username: "NotifyMe-Bot",
            embeds: [],
        };
    }

    private _forgeEmbed(){
        for (const method of this.#_content){
            if (method) {
                for(const items of method) {
                        for(const item of items.item!) {
                            this.#_message.embeds.push({
                                timestamp: new Date(),
                                title: item.name,
                                type: "rich",
                                description: "We found a new item to buy!",
                                url: item.url,
                                thumbnail: {
                                    url: "https://assets.reedpopcdn.com/ps5-console.png/BROK/thumbnail/1200x900/quality/100/ps5-console.png",
                                    height: 200,
                                    width: 200,
                                },
                            })
                    }
                }
            }
        }

    }

    render(){
        this._forgeEmbed()
        if(this.#_message.embeds.length!==0){
            return this.#_message
        } else {
            return null
        }
    }
}