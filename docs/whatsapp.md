# WhatsApp

TOM will use the official Meta WhatsApp Business Cloud API.

Phase 2 implements the official provider boundary for:

- webhook GET verification challenge
- webhook POST `x-hub-signature-256` verification
- normalized incoming message extraction
- outbound text, image, audio, and sticker sends by media ID
- provider configuration/status reporting
- WABA subscription endpoint documentation
- phone number ID/display metadata configuration

Verified documentation anchors:

- Meta's Postman Cloud API collection identifies the Graph `/messages` endpoint, WABA subscription endpoint, WABA phone number lookup, required business assets, and access-token model.
- Meta's Cloud API webhook flow uses a GET challenge with `hub.mode`, `hub.verify_token`, and `hub.challenge`.
- Meta webhook deliveries use `x-hub-signature-256` HMAC verification with the Meta app secret.

Before extending provider features, verify current official documentation for:

- webhook verification challenge behavior
- webhook signature header and HMAC calculation
- inbound message payload shapes
- media download flow
- supported outbound text, image, audio, and sticker messages
- phone number and business account configuration
- group conversation capabilities and limitations
- business onboarding and chat link format

Provider-specific payloads must remain inside a `WhatsAppCloudProvider`. Application code consumes normalized domain types such as `IncomingMessage`.

Private Tom control commands such as `/groups` require the webhook identity resolver to provide trusted `userId` and `conversation.type = PRIVATE_TOM`. The command must not run in a group conversation and must not enumerate groups outside the requester's authorized memberships.

## Group Discovery

Tom must not assume it can enumerate every group on a user's personal WhatsApp account. Groups enter TOM only through trusted mechanisms:

- verified provider events where officially supported
- verified incoming group events where officially supported
- explicit authorized onboarding/registration flow
- another documented provider capability

Current provider capability reporting marks group discovery as `unsupported`. The `GroupRegistryService` is the only backend service that registers or updates groups, and it is not exposed as an AI tool.

Explicitly forbidden without approval:

- `whatsapp-web.js`
- Baileys
- Venom
- Puppeteer/browser WhatsApp automation
- unofficial WhatsApp session QR login
