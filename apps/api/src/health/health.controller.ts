import { Controller, Get } from "@nestjs/common";
import type { HealthStatus } from "@tom/types";

interface HealthCheck {
  name: string;
  status: HealthStatus;
  detail?: string;
}

@Controller("health")
export class HealthController {
  @Get()
  health(): { status: HealthStatus; checks: HealthCheck[] } {
    const checks: HealthCheck[] = [
      { name: "API", status: "HEALTHY" },
      {
        name: "PostgreSQL",
        status: process.env.DATABASE_URL ? "NOT_CONFIGURED" : "NOT_CONFIGURED",
        detail: "Connection check lands after Prisma client wiring.",
      },
      {
        name: "Redis",
        status: process.env.REDIS_URL ? "NOT_CONFIGURED" : "NOT_CONFIGURED",
        detail: "Connection check lands with BullMQ worker wiring.",
      },
      {
        name: "OpenAI",
        status: process.env.OPENAI_API_KEY ? "HEALTHY" : "NOT_CONFIGURED",
      },
      {
        name: "WhatsApp",
        status:
          process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID
            ? "DEGRADED"
            : "NOT_CONFIGURED",
        detail: "Provider verification is scheduled for Phase 2.",
      },
    ];

    return {
      status: checks.every((check) => check.status === "HEALTHY") ? "HEALTHY" : "DEGRADED",
      checks,
    };
  }
}
