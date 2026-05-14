# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Node Sentinel AI is a compliance monitoring platform for digital asset transactions, used by compliance analysts.

## Commands

```bash
# Development (all apps in parallel)
yarn dev

# Single app
yarn dev --filter=web             # dashboard only (port 3000)
yarn dev --filter=transaction-engine

# Build / lint / type-check
yarn build
yarn lint
yarn check-types
yarn format                       # Prettier over *.ts, *.tsx, *.md

# Prisma (run from repo root — prisma.config.ts wires it to transaction-engine)
npx prisma migrate dev
npx prisma studio
```

## Architecture

### Request flow

```
Browser → Next.js middleware (Auth0) → /app/api/transactions → transactionPoller → transaction-engine :5000
```

- `apps/dashboard/proxy.ts` is the Next.js middleware file (Auth0 wraps every request; unauthenticated users are redirected to `/auth/login`).
- The dashboard never talks to the database directly — it proxies through the transaction-engine Express API.
- `apps/dashboard/app/api/transactions/route.ts` is the only API route; it calls `lib/transactionPoller.ts` which hits `http://localhost:5000/transactions`.

### Transaction engine (`apps/transaction-engine`, port 5000)

Express 5 app with no router files — all routes are inline in `src/index.ts`:

| Endpoint | Purpose |
|---|---|
| `GET /transactions?fromId=<id>` | Fetch all transactions, or only those after `fromId` |
| `POST /transactions/generate` | Generate and persist one synthetic transaction |
| `POST /transactions/generate-many` | Bulk generate 20 transactions |
| `GET /convert?amount=&from=&to=` | Fiat/crypto currency conversion |

A `setInterval` (40 s) auto-generates transactions continuously while the server is running.

**Services:**
- `fxService.ts` — fetches live crypto prices from CoinGecko; results cached in memory (`PriceCache`)
- `exchangeRateService.ts` — fiat conversions via CurrencyFreaks API
- `transactionStore.ts` — thin wrapper around the Prisma client
- `transactionGenerator.ts` — assembles a random `Transaction` (userId 1–10, BTC/ETH/SOL, USD/EUR/GBP, countries US/UK/DE/IR)

### Dashboard (`apps/dashboard`, port 3000)

Next.js 16 App Router. shadcn/ui components are installed locally under `apps/dashboard/components/ui/` (not in `packages/ui`). `packages/ui` holds minimal shared primitives (`button`, `card`, `code`) used across hypothetical future apps.

Tailwind 4 is used (PostCSS plugin, not the v3 config file).

### Database

PostgreSQL via Prisma. Schema lives in `apps/transaction-engine/prisma/schema.prisma`. The single model is `Transaction` (uuid PK, userId int, transactionType, cryptoType, fiatAmount, cryptoAmount, currency, country, createdAt).

## Environment variables

**`apps/dashboard/.env.local`** (Auth0):
```
AUTH0_SECRET=       # openssl rand -hex 32
AUTH0_DOMAIN=       # your-tenant.us.auth0.com
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
APP_BASE_URL=http://localhost:3000
```

**`apps/transaction-engine/.env`**:
```
DATABASE_URL=
COINGECKO_API_KEY=
CURRENCY_FREAKS_API_KEY=
```
