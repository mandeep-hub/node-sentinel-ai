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

# Prisma — there are TWO schemas, each with its own config file:
# Engine schema (User/Currency/Balance/Transaction) — root prisma.config.ts
npx prisma migrate dev
npx prisma studio

# Dashboard schema (Case) — apps/dashboard/prisma.dashboard.config.ts
cd apps/dashboard && npx prisma migrate dev
```

Both schemas use the same `DATABASE_URL` (one Postgres instance, two independently-migrated schemas). There is no test runner wired up.

## Architecture

### Request flow

```
Browser → Next.js middleware (Auth0) → /app/api/* → (engine HTTP for transactions) OR (dashboard Prisma for cases)
                                                            ↓                                    ↓
                                              transaction-engine :5000 → Postgres   →   same Postgres (separate schema)
```

Two read paths:
- **Transactions, balances, FX** — dashboard never reads these from Postgres directly. It calls the engine over HTTP via `apps/dashboard/lib/transactionPoller.ts` / `transactionApi.ts`.
- **Cases** — the dashboard owns the `Case` model and reads/writes it via its own Prisma client (`apps/dashboard/lib/prisma.ts`, generated to `apps/dashboard/generated/prisma`). Cases are produced by the dashboard's fraud scanner, not the engine.

Auth0 wraps every request via `apps/dashboard/proxy.ts` (the Next.js middleware file); unauthenticated users are redirected to `/auth/login`.

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

API routes under `app/api/`:
- `transactions/` — proxies the engine
- `cases/summary/` — reads from the dashboard's own Prisma
- `scan/` — manual trigger for `fraudScanner.scanTransactions()`
- `auth/` — Auth0

Background work: `apps/dashboard/jobs/fraudScanJob.ts` runs a 10 s `setInterval` that fetches transactions from the engine and, for any matching the rules in `lib/fraudScanner.ts`, inserts a `Case` row via `lib/caseService.ts`. Cases are deduped by the `Case.transactionId` unique constraint.

### Database (Prisma + Postgres)

Two schemas in one Postgres instance, owned by different apps:

**Engine schema** (`apps/transaction-engine/prisma/schema.prisma`):
- `User` — uuid id, name, email
- `Currency` — `code` PK (e.g. `BTC`, `USD`), `kind`, `decimals`
- `Balance` — composite PK `(userId, currencyCode)`, `Decimal(38,18)` amount
- `Transaction` — uuid id, `kind`, optional `creditCurrencyCode`/`creditAmount` and `debitCurrencyCode`/`debitAmount` (both nullable so deposits, withdrawals, and exchanges share one shape), `status`, `flaggedAt`, `flagReason`, optional `country` / `profession` compliance signals, `metadata` JSON

A transaction can have either or both sides set — `balanceService` interprets whichever side(s) are populated.

**Dashboard schema** (`apps/dashboard/prisma/schema.prisma`):
- `Case` — uuid id, unique `caseId`, unique `transactionId`, `userId`, `amount` (`Decimal(38,18)`), `currency`, `transactionType`, `status`, `reason`, `createdAt`

There is no foreign key between `Case.transactionId` and the engine's `Transaction.id` — they live in separate Prisma schemas. The dashboard treats the transaction id as an opaque string echoed back from the engine API.

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
