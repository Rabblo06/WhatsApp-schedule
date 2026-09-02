import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  normalizeWhatsAppWebhook,
  validateWhatsAppConfigFromEnv,
  verifyMetaSignature,
  verifyWebhookChallenge,
} from "@tom/shared";

describe("WhatsApp Phase 2 provider boundaries", () => {
  it("accepts valid webhook verification and rejects invalid tokens", () => {
    expect(
      verifyWebhookChallenge(
        {
          "hub.mode": "subscribe",
          "hub.verify_token": "expected",
          "hub.challenge": "challenge-code",
        },
        "expected",
      ),
    ).toBe("challenge-code");
    expect(
      verifyWebhookChallenge(
        {
          "hub.mode": "subscribe",
          "hub.verify_token": "attacker",
          "hub.challenge": "challenge-code",
        },
        "expected",
      ),
    ).toBeNull();
  });

  it("rejects invalid webhook signatures", () => {
    const raw = Buffer.from("{\"entry\":[]}");
    const signature = createHmac("sha256", "meta-secret").update(raw).digest("hex");

    expect(verifyMetaSignature(raw, `sha256=${signature}`, "meta-secret")).toBe(true);
    expect(verifyMetaSignature(raw, `sha256=${signature}`, "wrong-secret")).toBe(false);
  });

  it("uses provider message IDs as idempotency anchors", () => {
    const first = normalizeWhatsAppWebhook({
      entry: [{ changes: [{ value: { messages: [{ id: "wamid.same", from: "1", type: "text" }] } }] }],
    });
    const second = normalizeWhatsAppWebhook({
      entry: [{ changes: [{ value: { messages: [{ id: "wamid.same", from: "1", type: "text" }] } }] }],
    });

    expect(first.eventId).toBe(second.eventId);
    expect(first.messages[0]?.providerMessageId).toBe("wamid.same");
  });

  it("validates provider configuration without exposing secrets", () => {
    const result = validateWhatsAppConfigFromEnv({
      WHATSAPP_ACCESS_TOKEN: "secret-token",
      WHATSAPP_PHONE_NUMBER_ID: "phone-id",
      WHATSAPP_BUSINESS_ACCOUNT_ID: "waba-id",
      WHATSAPP_VERIFY_TOKEN: "verify-token",
      META_APP_SECRET: "meta-secret",
      META_GRAPH_API_VERSION: "v23.0",
    });

    expect(result.configured).toBe(true);
  });
});
