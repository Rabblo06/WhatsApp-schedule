import { Module } from "@nestjs/common";
import { AuthController } from "./auth/auth.controller.js";
import { AuthService } from "./auth/auth.service.js";
import { GroupsController } from "./groups/groups.controller.js";
import { GroupsService } from "./groups/groups.service.js";
import { HealthController } from "./health/health.controller.js";
import { CommandController } from "./messages/command.controller.js";
import { GroupRegistryService } from "./whatsapp/group-registry.service.js";
import { WhatsAppController } from "./whatsapp/whatsapp.controller.js";
import { WhatsAppProviderService } from "./whatsapp/whatsapp-provider.service.js";
import { WhatsAppWebhookController } from "./whatsapp/whatsapp-webhook.controller.js";
import { WhatsAppWebhookService } from "./whatsapp/whatsapp-webhook.service.js";

@Module({
  controllers: [
    AuthController,
    HealthController,
    CommandController,
    GroupsController,
    WhatsAppController,
    WhatsAppWebhookController,
  ],
  providers: [
    AuthService,
    GroupsService,
    GroupRegistryService,
    WhatsAppProviderService,
    WhatsAppWebhookService,
  ],
})
export class AppModule {}
