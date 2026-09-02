# Schedules And Reminders

Schedules are persistent records owned by a user and linked to source messages where available.

Reminders are durable records with states:

- `SCHEDULED`
- `QUEUED`
- `PROCESSING`
- `SENT`
- `FAILED`
- `CANCELLED`

Phase 1 creates the schema and worker skeleton. Later phases will add:

- AI tool handlers for schedule/reminder CRUD
- BullMQ repeatable/delayed jobs
- idempotent WhatsApp reminder delivery
- retry and exponential backoff policy
- failure tracking and dashboard views

Durable reminder behavior must use Redis + BullMQ and database state, never process-local timers.
