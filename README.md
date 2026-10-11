# Inkora Blog Backend

A minimal GraphQL-first NestJS backend foundation for the Inkora blog platform.

## Stack

- NestJS 12
- GraphQL with Apollo
- Prisma ORM
- PostgreSQL via Docker Compose
- TypeScript + Vitest
- JWT/authentication scaffolding

## Quick start

1. Install dependencies
   ```bash
   pnpm install
   ```

2. Start PostgreSQL
   ```bash
   docker compose up -d postgres
   ```

3. Push the Prisma schema to the database
   ```bash
   pnpm prisma db push
   ```

4. Start the API in development mode
   ```bash
   pnpm start:dev
   ```

5. Open GraphQL Playground
   - http://localhost:3000/graphql

## Environment

Copy the sample environment file and adjust secrets if needed:

```bash
cp .env.example .env
```

Required values include:
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `POSTGRES_*`

## Available scripts

```bash
pnpm test
pnpm test:e2e
pnpm build
pnpm lint
pnpm format
pnpm db:generate
pnpm db:push
pnpm db:studio
```

## Notes

This project intentionally starts with the backend foundation only. The blog domain and business features are intentionally not implemented yet.
