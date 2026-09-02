import { Injectable } from "@nestjs/common";
import {
  getWhatsAppCapabilities,
  validateWhatsAppConfigFromEnv,
  type WhatsAppConnectionStatus,
} from "@tom/shared";
import type { MessagingCapabilities, MessagingProvider } from "@tom/types";

type MessagePayload =
  | { messaging_product: "whatsapp"; to: string; type: "text"; text: { body: string; preview_url: boolean } }
  | { messaging_product: "whatsapp"; to: string; type: "image"; image: { id: string; caption?: string } }
  | { messaging_product: "whatsapp"; to: string; type: "audio"; audio: { id: string } }
  | { messaging_product: "whatsapp"; to: string; type: "sticker"; sticker: { id: string } };

@Injectable()
export class WhatsAppProviderService implements MessagingProvider {
  getCapabilities(): MessagingCapabilities {
    return getWhatsAppCapabilities();
  }

  getStatus(): WhatsAppConnectionStatus {
    const config = validateWhatsAppConfigFromEnv(process.env);
    const capabilities = getWhatsAppCapabilities();

    if (config.configured === false) {
      return {
        status: "NOT_CONFIGURED",
        webhookStatus: "UNKNOWN",
        providerError: `Missing: ${config.missing.join(", ")}`,
        capabilities,
      };
    }

    return {
      status: "CONNECTED",
      businessAccountId: config.config.businessAccountId,
      phoneNumberId: config.config.phoneNumberId,
      displayPhoneNumber: process.env.WHATSAPP_DISPLAY_PHONE_NUMBER,
      webhookStatus: "UNKNOWN",
      capabilities,
    };
  }

  async sendText(to: string, text: string): Promise<unknown> {
    return this.sendMessage({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text, preview_url: false },
    });
  }

  async sendImage(to: string, mediaId: string, caption?: string): Promise<unknown> {
    return this.sendMessage({
      messaging_product: "whatsapp",
      to,
      type: "image",
      image: caption ? { id: mediaId, caption } : { id: mediaId },
    });
  }

  async sendAudio(to: string, mediaId: string): Promise<unknown> {
    return this.sendMessage({
      messaging_product: "whatsapp",
      to,
      type: "audio",
      audio: { id: mediaId },
    });
  }

  async sendSticker(to: string, mediaId: string): Promise<unknown> {
    return this.sendMessage({
      messaging_product: "whatsapp",
      to,
      type: "sticker",
      sticker: { id: mediaId },
    });
  }

  async downloadMedia(providerMediaId: string): Promise<Uint8Array> {
    throw new Error(`Media download is not implemented yet for media ${providerMediaId}`);
  }

  private async sendMessage(payload: MessagePayload): Promise<unknown> {
    const config = validateWhatsAppConfigFromEnv(process.env);
    if (!config.configured) {
      throw new Error("WhatsApp provider is not configured");
    }

    const response = await fetch(
      `https://graph.facebook.com/${config.config.graphApiVersion}/${config.config.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      throw new Error(`WhatsApp send failed with status ${response.status}`);
    }

    return response.json();
  }
}
