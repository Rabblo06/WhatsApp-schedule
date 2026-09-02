export type IncomingMessageType =
  | "TEXT"
  | "IMAGE"
  | "VOICE"
  | "AUDIO"
  | "STICKER"
  | "DOCUMENT"
  | "LOCATION";

export type TomCommandKind = "TOM" | "STORE" | "GROUPS" | "GROUP_SELECT" | "ORDINARY";
export type GroupListFilter = "ALL" | "ACTIVE" | "DISABLED";
export type TomGroupStatus = "ACTIVE" | "DISABLED";

export interface IncomingMessage {
  provider: "WHATSAPP_CLOUD";
  providerMessageId: string;
  senderExternalId: string;
  conversationExternalId: string;
  groupExternalId?: string;
  type: IncomingMessageType;
  text?: string;
  providerMediaId?: string;
  replyToProviderMessageId?: string;
  timestamp: Date;
}

export interface AuthorizedTomGroup {
  groupId: string;
  displayName: string;
  status: TomGroupStatus;
}

export interface DisplayedTomGroup {
  reference: string;
  displayName: string;
  status: TomGroupStatus;
}

export interface MessagingCapabilities {
  text: boolean;
  image: boolean;
  audio: boolean;
  sticker: boolean;
  groups: "unsupported" | "limited" | "supported";
}

export interface MessagingProvider {
  sendText(to: string, text: string): Promise<unknown>;
  sendImage(to: string, mediaId: string, caption?: string): Promise<unknown>;
  sendAudio(to: string, mediaId: string): Promise<unknown>;
  sendSticker(to: string, mediaId: string): Promise<unknown>;
  downloadMedia(providerMediaId: string): Promise<Uint8Array>;
  getCapabilities(): MessagingCapabilities;
}

export type HealthStatus = "HEALTHY" | "DEGRADED" | "OFFLINE" | "NOT_CONFIGURED";
