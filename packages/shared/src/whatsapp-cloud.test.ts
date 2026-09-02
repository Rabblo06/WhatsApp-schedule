import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  getWhatsAppCapabilities,
  normalizeWhatsAppWebhook,
  validateWhatsAppConfigFromEnv,
  verifyMetaSignature,
  verifyWebhookChallenge,
} from "./whatsapp-cloud.js";

describe("whatsapp cloud helpers", () => {
  it("verifies webhook challenges", () => {
    expect(
      verifyWebhookChallenge(
        {
          "hub.mode": "subscribe",
          "hub.verify_token": "verify",
          "hub.challenge": "12345",
        },
        "verify",
      ),
    ).toBe("12345");
    expect(
      verifyWebhookChallenge(
        { "hub.mode": "subscribe", "hub.verify_token": "wrong", "hub.challenge": "12345" },
        "verify",
      ),
    ).toBeNull();
  });

  it("rejects invalid webhook signatures", () => {
    const rawBody = Buffer.from(JSON.stringify({ ok: true }));
    const valid = createHmac("sha256", "secret").update(rawBody).digest("hex");

    expect(verifyMetaSignature(rawBody, `sha256=${valid}`, "secret")).toBe(true);
    expect(verifyMetaSignature(rawBody, `sha256=${valid}`, "wrong")).toBe(false);
    expect(verifyMetaSignature(rawBody, "bad", "secret")).toBe(false);
  });

  it("normalizes incoming messages", () => {
    const event = normalizeWhatsAppWebhook({
      entry: [
        {
          changes: [
            {
              value: {
                metadata: { phone_number_id: "phone-1" },
                messages: [
                  {
                    id: "wamid.1",
                    from: "447700900123",
                    timestamp: "1700000000",
                    type: "text",
                    text: { body: "/groups" },
                  },
                ],
              },
            },
          ],
        },
      ],
    });

    expect(event.phoneNumberId).toBe("phone-1");
    expect(event.messages[0]).toMatchObject({
      providerMessageId: "wamid.1",
      senderExternalId: "447700900123",
      conversationExternalId: "447700900123",
      type: "TEXT",
      text: "/groups",
    });
  });

  it("validates provider configuration", () => {
    expect(validateWhatsAppConfigFromEnv({}).configured).toBe(false);
    expect(
      validateWhatsAppConfigFromEnv({
        WHATSAPP_ACCESS_TOKEN: "token",
        WHATSAPP_PHONE_NUMBER_ID: "phone",
        WHATSAPP_BUSINESS_ACCOUNT_ID: "waba",
        WHATSAPP_VERIFY_TOKEN: "verify",
        META_APP_SECRET: "secret",
        META_GRAPH_API_VERSION: "v23.0",
      }).configured,
    ).toBe(true);
  });

  it("reports unsupported group discovery by default", () => {
    expect(getWhatsAppCapabilities().groupDiscovery).toBe("unsupported");
    expect(getWhatsAppCapabilities().groups).toBe("unsupported");
  });
});
