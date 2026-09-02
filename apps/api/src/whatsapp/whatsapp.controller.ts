import { Controller, Get } from "@nestjs/common";
import { WhatsAppProviderService } from "./whatsapp-provider.service.js";

@Controller("whatsapp")
export class WhatsAppController {
  constructor(private readonly provider: WhatsAppProviderService) {}

  @Get("status")
  status() {
    return this.provider.getStatus();
  }
}
