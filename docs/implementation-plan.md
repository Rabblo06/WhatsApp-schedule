# Implementation Plan

## Existing Architecture

The repository was empty at discovery time. No existing `AGENTS.md`, manifests, database config, deployment config, or application code existed.

## Provider And API Assumptions To Verify

- Meta WhatsApp Cloud API webhook verification, signature validation, message/media payloads, outbound audio/sticker support, group limitations, and chat link/QR behavior.
- OpenAI Responses API, vision input, transcription, TTS, tool calling, and configurable cost metadata.
- S3-compatible storage SDK behavior for the selected provider.

## Phase Completion Criteria

### Phase 1: Foundation

- Monorepo structure exists.
- API, dashboard, and worker apps compile.
- Prisma schema validates.
- Environment validation exists.
- Admin authentication primitives exist.
- Private `/groups` control command foundation filters by trusted user authorization.
- Docker Compose provides PostgreSQL and Redis.
- Base tests cover command activation, idempotency primitive, auth cookie primitives, and redaction.

### Phase 2: WhatsApp

- Official provider abstraction implemented.
- Webhook verification and signatures validated.
- Inbound messages normalized and idempotently persisted.
- Outbound message methods implemented for verified supported types.
- `/groups` uses safe numbered references and `/group <number>` resolves only through the trusted authorized list.
- Group registration is centralized in `GroupRegistryService` and is not available to AI input.
- Group discovery remains unavailable unless a verified provider/onboarding capability supplies trusted group identity.

### Phase 3: TOM AI

- `/tom` and natural `Tom ...` route to AI.
- Ordinary messages never call OpenAI.
- OpenAI Responses integration and validated tool calls exist.

### Phase 4: Schedules And Reminders

- Schedule/reminder tools mutate persistent records.
- BullMQ jobs deliver reminders idempotently.
- Worker heartbeat and retries are visible.

### Later Phases

Implement `/store`, memory library, personality/reaction ranking, complete dashboard pages, security audit, and production deployment checklist.
