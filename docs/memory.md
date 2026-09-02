# Memory

`/store` saves the nearest eligible previous message from the same user and conversation within a configurable safety window.

Supported reaction types:

- `TEXT`
- `VOICE`
- `AUDIO`
- `STICKER`
- `IMAGE`
- `MEME`

Stored reactions keep original media when available, plus transcript, tags, mood, intensity, scope, usage counts, feedback counts, and enabled state.

Phase 1 only defines schema and boundaries. Phase 5 will implement media lookup, storage, transcription, and tagging.
