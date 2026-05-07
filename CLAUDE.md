# Node Sentinel AI

Compliance monitoring platform for digital asset transactions, used by compliance analysts.

## Monorepo Structure

- `apps/dashboard` — Next.js 16, App Router, port 3000
- `apps/transaction-engine` — Express API
- `packages/ui` — shared components
- `packages/eslint-config` — shared ESLint config
- `packages/typescript-config` — shared TypeScript config

## Tech Stack

- Next.js 16, React 19, TypeScript
- Turborepo + Yarn workspaces
- Auth0 via `@auth0/nextjs-auth0`

## Conventions

- Dashboard routes: `apps/dashboard/app/`
- Shared components: `packages/ui`
- Environment variables: `apps/dashboard/.env.local`
- Only compliance analysts access the dashboard
