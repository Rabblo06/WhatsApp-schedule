# TOM Project Notes

TOM is a Tamil/Tanglish WhatsApp assistant with an admin dashboard. Keep this file short; detailed guidance lives in `docs/`.

Permanent rules:
- Do not call AI for ordinary messages. AI is activated only by `/tom ...` or `Tom ...`.
- Use the official Meta WhatsApp Cloud API only. Do not add WhatsApp Web automation libraries without explicit approval.
- Keep provider payloads behind normalized domain models.
- Never expose backend secrets to browser code.
- Validate inputs at service boundaries and derive user/conversation ownership from trusted server context.
- Keep architecture documentation updated when implementation changes.

Start with:
- `docs/architecture.md`
- `docs/implementation-plan.md`
- `docs/security.md`
- `docs/database.md`
- `docs/whatsapp.md`
- `docs/ai.md`
