# Deployment

The monorepo is designed for separate deployable processes:

- API service: `pnpm --filter @tom/api start:prod`
- Dashboard service: `pnpm --filter @tom/dashboard start`
- Worker service: `pnpm --filter @tom/worker start`

Local dependencies are provided by `docker-compose.yml`:

- PostgreSQL
- Redis

Provider-neutral deployment is preferred. Vercel, Railway, or equivalent services can host individual processes as long as environment variables, PostgreSQL, Redis, and object storage are configured.

Do not commit `.env`.
