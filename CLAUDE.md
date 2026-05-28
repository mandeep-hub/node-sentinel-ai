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
                                                            │
                                                            └── POST /api/cases → dashboard (webhook per transaction)
```

Two read paths:
- **Transactions, balances, FX** — dashboard never reads these from Postgres directly. It calls the engine over HTTP via `apps/dashboard/lib/transactionPoller.ts` / `transactionApi.ts`.
- **Cases** — the dashboard owns the `Case` model and reads/writes it via its own Prisma client (`apps/dashboard/lib/prisma.ts`, generated to `apps/dashboard/generated/prisma`).

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

`createTransaction` also fires a `POST` to `$DASHBOARD_URL/api/cases` for every transaction inside the same DB transaction. This is the primary path for case creation; the dashboard fraud scan job is a secondary polling fallback. Both paths are deduplicated by `Case.transactionId`.

Other services:
- `fxService.ts` — live crypto prices, cached in memory
- `exchangeRateService.ts` — fiat conversions via CurrencyFreaks
- `transactionGenerator.ts` — assembles randomized `UnsavedTransaction` objects; sets `status = "flagged"` for any transaction that meets suspicious criteria at generation time
- `balanceService.ts` — applies a transaction's debit/credit deltas to `Balance` rows

### Dashboard (`apps/dashboard`, port 3000)

Next.js 16 App Router. shadcn/ui components are installed locally under `apps/dashboard/components/ui/` (not in `packages/ui`). `packages/ui` holds minimal shared primitives (`button`, `card`, `code`). Tailwind 4 is used (PostCSS plugin; no v3 config file).

UI pages:
- `/` — landing/login page (server component, checks Auth0 session)
- `/transactions` — live transaction feed; polls the engine every 4 s directly via `NEXT_PUBLIC_TRANSACTION_ENGINE_URL` (bypasses the Next.js API proxy). Shows flagged transactions highlighted and lets analysts request a case.
- `/cases/[caseId]` — case detail page (client component). Fetches `/api/cases/[caseId]` on load; if `aiSummary` is missing, immediately calls `PATCH /api/cases/[caseId]/ai-summary` to generate one. Renders: AI summary + recommended actions, case fields, notes, audit log, escalate button, resolve section.

API routes under `app/api/`:
- `transactions/` — proxies the engine
- `cases/` — GET returns OPEN cases; POST calls `caseService.createCaseForSuspiciousTransaction` (called by the engine webhook)
- `cases/[caseId]/` — GET a single case by its `caseId` string
- `cases/[caseId]/ai-summary` — PATCH generates/regenerates AI summary via Gemini and saves it
- `cases/[caseId]/escalate` — PATCH sets `escalated=true`, `escalatedAt`, `status=ESCALATED`; idempotent
- `cases/[caseId]/resolve` — PATCH sets `status=CLOSED`, `resolvedAt`; idempotent
- `cases/[caseId]/message` — PATCH sets `messageSent=true`, `messageSentAt`
- `cases/[caseId]/notes` — PATCH appends a note entry; notes are stored as `JSON.stringify({text, savedAt}[])` in the `notes` text field, not as a plain string
- `cases/[caseId]/auto-assign` — PATCH sets the `autoAssignOnResolve` boolean flag
- `cases/assign/` — POST assigns a random OPEN case to the authenticated analyst (Auth0 session email); sets status to `IN_REVIEW`; returns `{alreadyAssigned, noCases, case}`
- `cases/summary/` — reads aggregate stats from the dashboard's own Prisma
- `scan/` — manual trigger for `fraudScanner.scanTransactions()`
- `ai-summary/` — POST calls `aiSummaryService.generateAiSummary` (Gemini)
- `auth/` — Auth0

Background work: `apps/dashboard/jobs/fraudScanJob.ts` runs a 10 s `setInterval` that fetches transactions from the engine and calls `lib/caseService.ts` for each. Cases are deduped by the `Case.transactionId` unique constraint.

Key lib files:
- `caseService.ts` — `createCaseForSuspiciousTransaction`: only acts on `status === "flagged"` transactions where the debit or credit amount converts to ≥ $10,000 USD. Calls `generateAiSummary` (Gemini, falls back to a static string) then `calculateRiskScore`, and saves both to the new `Case`.
- `aiSummaryService.ts` — wraps Google Gemini (`@google/genai`) to produce 2–3 sentence AML narrative summaries.
- `riskScoreService.ts` — `calculateRiskScore(country, profession, cases[])` returns `{ riskScore, riskBand }`. Bands: `LOW / MEDIUM / HIGH / CRITICAL / RESTRICTED`. `RESTRICTED` is returned immediately for sanctioned countries (IR, KP). Score is based on country risk tier, profession, open/in-review case counts, round-amount patterns, and near-threshold structuring signals.
- `exchangeRateService.ts` (dashboard) — fiat conversion used by `caseService` to normalize amounts to USD for threshold checks.
- `fraudScanner.ts` — thin orchestrator: fetches transactions, calls `createCaseForSuspiciousTransaction` for each.

### Database (Prisma + Postgres)

Two schemas in one Postgres instance, owned by different apps:

**Engine schema** (`apps/transaction-engine/prisma/schema.prisma`):
- `User` — uuid id, name, email
- `Currency` — `code` PK (e.g. `BTC`, `USD`), `kind`, `decimals`
- `Balance` — composite PK `(userId, currencyCode)`, `Decimal(38,18)` amount
- `Transaction` — uuid id, `kind`, optional `creditCurrencyCode`/`creditAmount` and `debitCurrencyCode`/`debitAmount` (both nullable so deposits, withdrawals, and exchanges share one shape), `status` (`settled`/`pending`/`flagged`/`reversed`), `flaggedAt`, `flagReason`, optional `country` / `profession` compliance signals, `metadata` JSON

A transaction can have either or both sides set — `balanceService` interprets whichever side(s) are populated.

**Dashboard schema** (`apps/dashboard/prisma/schema.prisma`):
- `Case` — uuid id, unique `caseId` (`CASE-<timestamp>`), unique `transactionId`, `userId`, `amount` (`Decimal(38,18)`), `currency`, `transactionType`, `status` (`OPEN`/`IN_REVIEW`/`ESCALATED`/`CLOSED`), `reason`, `aiSummary`, `country`, `profession`, `riskScore` (int), `riskBand` (string), `assignedTo`, `assignedEmail`, `assignedAt`, `escalated`, `escalatedAt`, `messageSent`, `messageSentAt`, `notes`, `resolvedAt`, `autoAssignOnResolve`, `createdAt`

There is no foreign key between `Case.transactionId` and the engine's `Transaction.id` — they live in separate Prisma schemas.

Case status transitions: `OPEN → IN_REVIEW` (on assign) → `ESCALATED` (on escalate) or `CLOSED` (on resolve). The `escalated` boolean and `status=ESCALATED` are set together; a case can be both `IN_REVIEW` and `escalated=true`. `apps/cases/mock-data.ts` is a stale unused file — the UI fetches live data from the API.

## Environment variables

**`apps/dashboard/.env.local`**:
```
AUTH0_SECRET=       # openssl rand -hex 32
AUTH0_DOMAIN=       # your-tenant.us.auth0.com
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
APP_BASE_URL=http://localhost:3000
GEMINI_API_KEY=
GEMINI_MODEL=       # optional, defaults to gemini-2.5-flash
DATABASE_URL=
NEXT_PUBLIC_TRANSACTION_ENGINE_URL=http://localhost:5000   # used client-side by the transactions page
```

**`apps/transaction-engine/.env`**:
```
DATABASE_URL=
COINGECKO_API_KEY=
CURRENCY_FREAKS_API_KEY=
DASHBOARD_URL=      # required — createTransaction POSTs /api/cases to this URL
```
