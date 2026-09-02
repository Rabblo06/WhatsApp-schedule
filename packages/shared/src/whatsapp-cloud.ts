import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import type { IncomingMessage, IncomingMessageType, MessagingCapabilities } from "@tom/types";

export const whatsappCloudConfigSchema = z.object({
  accessToken: z.string().min(1),
  phoneNumberId: z.string().min(1),
  businessAccountId: z.string().min(1),
  verifyToken: z.string().min(1),
  appSecret: z.string().min(1),
  graphApiVersion: z.string().regex(/^v\d+\.\d+$/),
});

export type WhatsAppCloudConfig = z.infer<typeof whatsappCloudConfigSchema>;

export interface WhatsAppConnectionStatus {
  status: "CONNECTED" | "NOT_CONFIGURED" | "ERROR";
  businessAccountId?: string;
  phoneNumberId?: string;
  displayPhoneNumber?: string;
  webhookStatus: "VERIFIED" | "NOT_VERIFIED" | "UNKNOWN";
  lastWebhookAt?: string;
  lastIncomingMessageAt?: string;
  lastOutgoingMessageAt?: string;
  providerError?: string;
  capabilities: MessagingCapabilities & {
    groupDiscovery: "unsupported" | "trusted_events_only";
  };
}

export interface MetaWebhookMessage {
  id: string;
  from: string;
  timestamp?: string;
  type: string;
  text?: { body?: string };
  image?: { id?: string; mime_type?: string };
  audio?: { id?: string; mime_type?: string; voice?: boolean };
  sticker?: { id?: string; mime_type?: string };
  document?: { id?: string; mime_type?: string };
  context?: { id?: string };
}

export interface NormalizedWhatsAppWebhook {
  eventId: string;
  phoneNumberId: string;
  messages: IncomingMessage[];
}

export function getWhatsAppCapabilities(): WhatsAppConnectionStatus["capabilities"] {
  return {
    text: true,
    image: true,
    audio: true,
    sticker: true,
    groups: "unsupported",
    groupDiscovery: "unsupported",
  };
}

export function validateWhatsAppConfigFromEnv(
  env: NodeJS.ProcessEnv,
): { configured: true; config: WhatsAppCloudConfig } | { configured: false; missing: string[] } {
  const raw = {
    accessToken: env.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID,
    businessAccountId: env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    verifyToken: env.WHATSAPP_VERIFY_TOKEN,
    appSecret: env.META_APP_SECRET,
    graphApiVersion: env.META_GRAPH_API_VERSION ?? "v23.0",
  };
  const result = whatsappCloudConfigSchema.safeParse(raw);

  if (result.success) {
    return { configured: true, config: result.data };
  }

  return {
    configured: false,
    missing: result.error.issues.map((issue) => issue.path.join(".")),
  };
}

export function verifyWebhookChallenge(
  query: Record<string, string | undefined>,
  verifyToken: string,
): string | null {
  if (
    query["hub.mode"] !== "subscribe" ||
    query["hub.verify_token"] !== verifyToken ||
    !query["hub.challenge"]
  ) {
    return null;
  }

  return query["hub.challenge"];
}

export function verifyMetaSignature(
  rawBody: Buffer,
  signatureHeader: string | undefined,
  appSecret: string,
): boolean {
  if (!signatureHeader?.startsWith("sha256=")) {
    return false;
  }

  const receivedHex = signatureHeader.slice("sha256=".length);
  if (!/^[a-f0-9]{64}$/i.test(receivedHex)) {
    return false;
  }

  const expectedHex = createHmac("sha256", appSecret).update(rawBody).digest("hex");
  const received = Buffer.from(receivedHex, "hex");
  const expected = Buffer.from(expectedHex, "hex");

  return received.length === expected.length && timingSafeEqual(received, expected);
}

export function createWebhookEventId(payload: unknown): string {
  const value = payload as {
    entry?: Array<{ id?: string; changes?: Array<{ value?: { messages?: MetaWebhookMessage[] } }> }>;
  };
  const messageId = value.entry?.flatMap((entry) => entry.changes ?? [])?.[0]?.value?.messages?.[0]?.id;
  return messageId ? `message:${messageId}` : createHmac("sha256", "tom-webhook-event").update(JSON.stringify(payload)).digest("hex");
}

export function normalizeWhatsAppWebhook(payload: unknown): NormalizedWhatsAppWebhook {
  const root = payload as {
    entry?: Array<{
      id?: string;
      changes?: Array<{
        value?: {
          metadata?: { phone_number_id?: string };
          messages?: MetaWebhookMessage[];
        };
      }>;
    }>;
  };

  const messages = root.entry?.flatMap((entry) =>
    (entry.changes ?? []).flatMap((change) => {
      return (change.value?.messages ?? []).map((message) =>
        normalizeMessage(message),
      );
    }),
  ) ?? [];

  const phoneNumberId =
    root.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id ?? "unknown";

  return {
    eventId: createWebhookEventId(payload),
    phoneNumberId,
    messages,
  };
}

function normalizeMessage(message: MetaWebhookMessage): IncomingMessage {
  return {
    provider: "WHATSAPP_CLOUD",
    providerMessageId: message.id,
    senderExternalId: message.from,
    conversationExternalId: message.from,
    type: mapMessageType(message),
    text: message.text?.body,
    providerMediaId:
      message.image?.id ?? message.audio?.id ?? message.sticker?.id ?? message.document?.id,
    replyToProviderMessageId: message.context?.id,
    timestamp: new Date(Number(message.timestamp ?? Math.floor(Date.now() / 1000)) * 1000),
    groupExternalId: undefined,
  };
}

function mapMessageType(message: MetaWebhookMessage): IncomingMessageType {
  if (message.type === "audio" && message.audio?.voice) {
    return "VOICE";
  }

  switch (message.type) {
    case "text":
      return "TEXT";
    case "image":
      return "IMAGE";
    case "audio":
      return "AUDIO";
    case "sticker":
      return "STICKER";
    case "document":
      return "DOCUMENT";
    default:
      return "TEXT";
  }
}
