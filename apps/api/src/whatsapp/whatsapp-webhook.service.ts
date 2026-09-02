import { Injectable } from "@nestjs/common";
import { prisma, type Prisma } from "@tom/database";
import { normalizeWhatsAppWebhook, redactSecrets } from "@tom/shared";

@Injectable()
export class WhatsAppWebhookService {
  async processVerifiedWebhook(payload: unknown): Promise<{ eventId: string; messages: number }> {
    const event = normalizeWhatsAppWebhook(payload);

    const webhookEvent = await prisma.webhookEvent.upsert({
      where: {
        provider_providerEventId: {
          provider: "WHATSAPP_CLOUD",
          providerEventId: event.eventId,
        },
      },
      update: {},
      create: {
        provider: "WHATSAPP_CLOUD",
        providerEventId: event.eventId,
        signatureValid: true,
        payload: JSON.parse(JSON.stringify(redactSecrets(payload))) as Prisma.InputJsonValue,
        processedAt: new Date(),
      },
    });

    if (webhookEvent.processedAt && webhookEvent.createdAt < webhookEvent.processedAt) {
      return { eventId: event.eventId, messages: 0 };
    }

    let persistedMessages = 0;
    for (const message of event.messages) {
      const user = await prisma.user.upsert({
        where: { externalId: message.senderExternalId },
        update: {},
        create: { externalId: message.senderExternalId },
      });

      const conversation = await prisma.conversation.upsert({
        where: {
          provider_externalId: {
            provider: "WHATSAPP_CLOUD",
            externalId: message.conversationExternalId,
          },
        },
        update: {},
        create: {
          provider: "WHATSAPP_CLOUD",
          externalId: message.conversationExternalId,
          type: message.groupExternalId ? "GROUP" : "PRIVATE_TOM",
        },
      });

      const created = await prisma.message.upsert({
        where: {
          provider_providerMessageId: {
            provider: "WHATSAPP_CLOUD",
            providerMessageId: message.providerMessageId,
          },
        },
        update: {},
        create: {
          provider: "WHATSAPP_CLOUD",
          providerMessageId: message.providerMessageId,
          conversationId: conversation.id,
          senderUserId: user.id,
          role: "USER",
          type: message.type,
          text: message.text,
          providerMediaId: message.providerMediaId,
          replyToProviderMessageId: message.replyToProviderMessageId,
          timestamp: message.timestamp,
        },
      });

      if (created.createdAt.getTime() === created.timestamp.getTime()) {
        persistedMessages += 1;
      }
    }

    return { eventId: event.eventId, messages: persistedMessages };
  }
}
