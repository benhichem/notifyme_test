export interface IPayload {
    website: string,
    item?: {name: string; url: string;}[]
}

export interface ILocals {
  PORT: number;
  HOST: string;
  API_Prefix: string;
  DC_WebHook: string;
  HeroServerPORT:number;
}

export interface ITargetList {
  website: string;
  selector: string;
  keywords?: Array<string>;
}
