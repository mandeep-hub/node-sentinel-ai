# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Node Sentinel AI is a compliance monitoring platform for digital asset transactions, used by compliance analysts.

## Commands

```bash
# Development (all apps in parallel via Turborepo)
yarn dev

# Single app
yarn dev --filter=web                 # dashboard only (port 3000)
yarn dev --filter=transaction-engine  # engine only (port 5000)

# Build / lint / type-check
yarn build
yarn lint
yarn check-types
yarn format                           # Prettier over *.ts, *.tsx, *.md

# Prisma (run from repo root — prisma.config.ts points at apps/transaction-engine)
npx prisma migrate dev
npx prisma studio
```

There is no test runner wired up.

## Architecture

### Request flow

```
Browser → Next.js middleware (Auth0) → /app/api/transactions → transactionPoller → transaction-engine :5000 → Postgres
```

The dashboard never talks to the database directly — it proxies through the transaction-engine HTTP API. `apps/dashboard/proxy.ts` is the Next.js middleware file (Auth0 wraps every request; unauthenticated users are redirected to `/auth/login`). `apps/dashboard/lib/transactionPoller.ts` is the client to the engine.

### Transaction engine (`apps/transaction-engine`, port 5000)

Express 5 app. `src/index.ts` only mounts routers and calls `initializeApp()`. Code is split into `routes/ → controllers/ → services/`, with `models/`, `jobs/`, and `bootstrap/` alongside.

Routers:

| Mount | File | Endpoints |
|---|---|---|
| `/transactions` | `routes/transactionRoutes.ts` | `GET /`, `POST /generate`, `POST /generate-many` |
| `/convert` | `routes/exchangeRoutes.ts` | fiat/crypto conversion |

`bootstrap/init.ts` runs on startup and is the source of all background work:
1. `seedUsers`, `seedCurrencies`, `seedBalances` — idempotent DB seeding
2. `updateCryptoPrices` once, then on a 40 s `setInterval` (CoinGecko, in-memory `PriceCache` in `fxService.ts`)
3. `startTransactionJobs` — a 4 s `setInterval` that generates 1–5 random transactions per tick (`jobs/transactionJob.ts`)

Critical service contract: **all transaction writes must go through `services/transactionService.ts::createTransaction`**, which wraps `transaction.create` + `updateBalances` in a single `prisma.$transaction`. Bypassing it (e.g. writing via `transactionStore` directly) will desync balances.

Other services:
- `fxService.ts` — live crypto prices, cached in memory
- `exchangeRateService.ts` — fiat conversions via CurrencyFreaks
- `transactionGenerator.ts` — assembles randomized `UnsavedTransaction` objects
- `balanceService.ts` — applies a transaction's debit/credit deltas to `Balance` rows

### Dashboard (`apps/dashboard`, port 3000)

Next.js 16 App Router. shadcn/ui components are installed locally under `apps/dashboard/components/ui/` (not in `packages/ui`). `packages/ui` holds minimal shared primitives (`button`, `card`, `code`). Tailwind 4 is used (PostCSS plugin; no v3 config file).

### Database (Prisma + Postgres)

Schema at `apps/transaction-engine/prisma/schema.prisma`. Models:

- `User` — uuid id, name, email
- `Currency` — `code` PK (e.g. `BTC`, `USD`), `kind`, `decimals`
- `Balance` — composite PK `(userId, currencyCode)`, `Decimal(38,18)` amount
- `Transaction` — uuid id, `kind`, optional `creditCurrencyCode`/`creditAmount` and `debitCurrencyCode`/`debitAmount` (both nullable so deposits, withdrawals, and exchanges share one shape), `status`, `flaggedAt`, `flagReason`, `metadata` JSON

A transaction can have either or both sides set — `balanceService` interprets whichever side(s) are populated.

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
