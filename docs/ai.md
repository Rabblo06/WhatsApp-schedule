# AI

TOM uses a dedicated backend AI layer. Browser code must never receive `OPENAI_API_KEY`.

Activation rule:

- `/tom ...` invokes TOM.
- `Tom ...` invokes TOM, case-insensitive, when `Tom` is the first word.
- Ordinary messages do not call OpenAI and do not receive a TOM reply.
- `/store` is handled by the memory pipeline, not the AI chat pipeline.

Before Phase 3, verify current official OpenAI documentation for:

- Responses API request shape
- image input
- transcription
- text-to-speech
- tool/function calling
- current model and pricing configuration

AI tools must validate arguments and derive trusted identity from server context. The model must never receive direct database credentials and must never execute arbitrary SQL.
