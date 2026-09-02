# Security

Security boundaries:

- Secrets remain server-side only.
- Admin sessions use signed HttpOnly cookies.
- Secure cookies are required in production.
- Passwords are hashed with Argon2id.
- API input is validated with Zod or DTO validation.
- Admin APIs require authentication.
- Webhook processing requires provider signature verification before side effects.
- Idempotency is enforced with database uniqueness.
- AI tool calls must pass authorization checks against trusted context.
- Logs redact authorization headers, cookies, passwords, tokens, API keys, and secrets.
- Media uploads/downloads require MIME and size validation before storage or AI use.
- `/groups` is allowed only from trusted `PRIVATE_TOM` context and lists only groups the requesting user can view or manage where Tom is enabled and authorized.
- `/groups` normal responses use numbered safe references only. Raw immutable `groupId` values remain server-side.
- `/group <number>` is resolved server-side against the current trusted user's authorized list. Names, arbitrary IDs, and LLM-supplied identifiers are rejected.
- Group names are display-only. Authorization uses immutable internal `groupId` values derived by the backend.
- The `GroupRegistryService` is a trusted backend/provider-only boundary. The LLM must never directly create or update `Group` records.

Phase 1 includes authentication primitives, secret redaction, environment validation, and schema constraints. Later phases must complete CSRF strategy, rate limiting, provider signatures, and media validation.
