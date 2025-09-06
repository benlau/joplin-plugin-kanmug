import { Message } from "./types";

export type WarningCommand = {
  type: "warning";
  message: string;
  duration?: number;
};

export type ShowBannerCommand = {
  type: "showBanner";
  messages: Message[];
};

export type Command = WarningCommand | ShowBannerCommand;
