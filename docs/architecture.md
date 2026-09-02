# Architecture

TOM is a pnpm monorepo with three deployable apps and shared packages:

- `apps/api`: NestJS HTTP API for admin auth, health, webhooks, command routing, and future WhatsApp/OpenAI integrations.
- `apps/dashboard`: Next.js App Router admin UI.
- `apps/worker`: BullMQ worker process for durable reminder delivery and background tasks.
- `packages/database`: Prisma schema and generated client boundary.
- `packages/shared`: shared domain models, command parsing, environment validation, logging helpers, and security utilities.
- `packages/types`: cross-app TypeScript contracts.
- `packages/config`: shared TypeScript configuration.
- `packages/ui`: future shared UI primitives.

Phase 1 implements the foundation only. WhatsApp provider calls, OpenAI calls, media storage, and real reminder delivery are represented by typed seams and documentation until later phases verify provider-specific behavior.

## Request Flow

Phase 1 establishes the intended processing pipeline:

1. API receives a webhook or internal request.
2. Payload is validated.
3. Idempotency key is checked before side effects.
4. Message is normalized into domain models.
5. Command router classifies `/tom`, natural `Tom ...`, `/store`, `/groups`, or ordinary messages.
6. Ordinary messages are persisted as context only and must not invoke AI.
7. Explicit commands are handed to later-phase handlers.

## Conversation Isolation

Conversations are typed as `PRIVATE_TOM` or `GROUP`. Raw message history must never cross conversation boundaries. A private Tom chat is a storage/configuration surface; a group conversation is a separate runtime context.

The `/groups` command is a private Tom control command. It lists only groups reachable through the trusted requesting user's active memberships where Tom is enabled and authorized. Normal WhatsApp responses show numbered safe references, not raw database IDs. `/group <number>` is resolved back to an immutable internal `groupId` by backend code from the authorized list; the user, client, and LLM must never supply or override that identifier.

## WhatsApp Provider

`WhatsAppProviderService` owns Meta Graph API send calls and capability reporting. `WhatsAppWebhookController` owns the official webhook challenge and delivery authenticity checks. `WhatsAppWebhookService` normalizes verified messages and persists them idempotently using provider event/message identifiers.

Group discovery is not assumed. `GroupRegistryService` centralizes trusted group registration/update paths and is not exposed to AI input.

## Runtime Choices

- Node.js runtime is used for API, worker, and dashboard server rendering.
- PostgreSQL is the durable source of truth.
- Redis is reserved for BullMQ queues and worker coordination.
- Prisma owns schema migrations.
