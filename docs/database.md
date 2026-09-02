# Database

The Prisma schema in `packages/database/prisma/schema.prisma` defines the normalized TOM data model for Phase 1 and future phases.

Core groups:

- Identity: `AdminUser`, `User`, `UserPreference`, `WhatsAppAccount`
- Conversation state: `Conversation`, `Group`, `GroupMember`, `Message`, `MediaAsset`
- Memory and reactions: `StoredReaction`, `ReactionTag`, `UserReactionPreference`, `TomMemory`
- Planning: `Schedule`, `ScheduleItem`, `Reminder`
- AI audit: `AIInteraction`, `AIToolInvocation`
- Operations: `WebhookEvent`, `BotEvent`, `BotError`, `WorkerHeartbeat`, `AuditLog`, `SystemSetting`

Important constraints:

- Webhook events are unique by `provider` + `providerEventId`.
- Messages are unique by `provider` + `providerMessageId`.
- Reminder delivery uses durable database state plus BullMQ job IDs, never `setTimeout()`.
- Ownership-sensitive operations must derive `userId`, `conversationId`, and `groupId` from server context.
- Conversations are typed as `PRIVATE_TOM` or `GROUP`.
- Groups include `status`, `tomEnabled`, and `tomAuthorized` flags. Listing groups must filter through `GroupMember` authorization (`canView` or `canManage`) and must never return all group rows.
- Stored reactions use explicit permission scopes: `PERSONAL_LIBRARY`, `GROUP_ONLY`, `GLOBAL_APPROVED`, and `DISABLED`.

The schema avoids large unbounded JSON fields except where provider metadata or sanitized AI metadata needs flexible storage.
