import {
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import {
  validateWhatsAppConfigFromEnv,
  verifyMetaSignature,
  verifyWebhookChallenge,
} from "@tom/shared";
import type { Request } from "express";
import { WhatsAppWebhookService } from "./whatsapp-webhook.service.js";

type RawBodyRequest = Request & { rawBody?: Buffer };

@Controller("webhooks/whatsapp")
export class WhatsAppWebhookController {
  constructor(private readonly webhookService: WhatsAppWebhookService) {}

  @Get()
  verify(@Query() query: Record<string, string | undefined>) {
    const config = validateWhatsAppConfigFromEnv(process.env);
    if (!config.configured) {
      throw new ForbiddenException("WhatsApp provider is not configured");
    }

    const challenge = verifyWebhookChallenge(query, config.config.verifyToken);
    if (!challenge) {
      throw new ForbiddenException("Invalid WhatsApp webhook verification request");
    }

    return challenge;
  }

  @Post()
  async receive(
    @Req() request: RawBodyRequest,
    @Headers("x-hub-signature-256") signature: string | undefined,
  ) {
    const config = validateWhatsAppConfigFromEnv(process.env);
    if (!config.configured) {
      throw new ForbiddenException("WhatsApp provider is not configured");
    }

    const rawBody = request.rawBody ?? Buffer.from(JSON.stringify(request.body ?? {}));
    if (!verifyMetaSignature(rawBody, signature, config.config.appSecret)) {
      throw new ForbiddenException("Invalid WhatsApp webhook signature");
    }

    return this.webhookService.processVerifiedWebhook(request.body);
  }
}
