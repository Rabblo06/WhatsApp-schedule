# TOM

Tamil/Tanglish WhatsApp assistant and admin platform.

## Local Development

```bash
corepack pnpm install
docker compose up -d
cp .env.example .env
corepack pnpm db:generate
corepack pnpm prisma:validate
corepack pnpm dev
```

Useful commands:

```bash
corepack pnpm build
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm db:migrate
corepack pnpm worker
```

Phase 1 provides the monorepo, schema, API foundation, dashboard shell, worker skeleton, environment validation, authentication primitives, and base tests. Later phases wire verified WhatsApp Cloud API and OpenAI behavior.
