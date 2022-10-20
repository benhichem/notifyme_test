export interface IDiscordMsg {
  username: string;
  //  content: string;
  embeds: IDiscordEmbeds[];
}
interface IDiscordEmbeds {
  title: string;
  type: "rich";
  description: string;
  url: string;
  timestamp: Date;
  thumbnail: IEmbedThumbnail;
}
interface IEmbedThumbnail {
  url: string;
  height: number;
  width: number;
}

interface IEmbedField {
  name: string;
  value: string;
  inline: boolean;
}
