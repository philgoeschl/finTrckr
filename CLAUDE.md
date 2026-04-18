# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

- **Framework**: Next.js 15 (App Router, TypeScript, `src/` directory)
- **Database**: PostgreSQL 16 via Prisma 5 ORM
- **UI**: Tailwind CSS v4 + shadcn/ui (components in `src/components/ui/`)
- **Charts**: Recharts
- **Validation**: Zod (schemas in `src/lib/validations.ts`, shared between API routes and forms)
- **Forms**: react-hook-form + `@hookform/resolvers`
- **Data fetching**: SWR (`src/hooks/useEntries.ts`)
- **Testing**: Vitest + @testing-library/react

## Commands

```bash
npm run dev          # start dev server (Turbopack)
npm run build        # production build
npm test             # run all tests
npm run test:watch   # watch mode
npm run lint         # ESLint

npx prisma studio    # inspect DB in browser
npx prisma migrate dev --name <name>    # create + apply migration
npx prisma generate  # regenerate client after schema changes
```

## Architecture

API routes live in `src/app/api/` alongside the pages — no separate backend process. All monetary values use `Decimal` in Prisma (not `Float`) to avoid floating-point drift.

`src/lib/validations.ts` is the single source of truth for the `EntryInput` schema; both API route handlers and the `EntryForm` component use it via Zod.

The `prisma/schema.prisma` `Entry` model has a dormant `userId String?` field and commented-out `User` model — the groundwork for adding Better Auth when user management is needed.

## Testing conventions

- API tests use `// @vitest-environment node` (top of file) — required for `request.formData()` to work
- Prisma is mocked via `vi.mock("@/lib/db", ...)` in API tests; no real DB is used
- XLSX test fixtures are generated inline with `XLSX.utils.aoa_to_sheet` — no fixture files needed

## Docker

- `docker-compose.yml` — production (build + run)
- `docker-compose.dev.yml` — dev overrides (hot reload, exposes port 5432)
- Start only the DB for local dev: `docker compose -f docker-compose.yml -f docker-compose.dev.yml up db -d`
