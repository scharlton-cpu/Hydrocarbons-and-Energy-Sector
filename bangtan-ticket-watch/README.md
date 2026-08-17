# Bangtan Ticket Watch

A resale-ticket intelligence dashboard for tracking BTS concert ticket prices across multiple marketplaces — not a
ticket store. When you find something worth buying, it sends you to the marketplace's own listing to complete the
purchase.

> The product name is a placeholder — change it in one place: `src/config/app.config.ts`.

## What it does

- Tracks resale listings for multiple cities/dates on one tour, across TickPick, StubHub, and SeatGeek.
- Tracks price history per listing (current / previous / 24h / 7-day high-low / % and $ change).
- Flags price drops (Minor / Notable / 🔥 Major / 🚨 Exceptional) and scores deals against comparable listings
  (🔥 Great / 🟢 Good / 🟡 Fair / 🔴 Above Market).
- Lets you build watches ("LA Floor Hunt: floor seats, ≤ $1,200") and get in-app alerts when listings match.
- Compares dates within a city and cities within a tour, with charts for price and inventory history.
- Ships with a working **Add City** form — new tour stops require no code changes.

## Status: MVP running on demo data

This app ships **fully usable with zero infrastructure** — no database, no marketplace API keys. It runs on:

- **A generated demo dataset** (`src/lib/demo-data/`) — BTS World Tour 2027, three cities (Los Angeles, Chicago,
  Toronto), realistic venues/seat zones/multiple concert dates, and ~20 days of price history per listing.
- **An in-memory data store** (`src/lib/demo-data/store.ts`) that lives for the life of the server process. Watches,
  alerts, and favorites you create persist until the dev server restarts.

Every screen that shows listing data also shows a **"● Demo data"** badge — this is generated data, and the app is
built to never present it as a live marketplace feed. See [Connecting live marketplace APIs](#connecting-live-marketplace-apis)
for how to change that.

## Architecture

```
Artist -> Tour -> City -> Venue -> ConcertEvent -> SeatZone
Provider -> ProviderEvent -> Listing -> PriceSnapshot
User -> Watch -> AlertRule -> AlertEvent -> NotificationLog
                            -> Favorite
```

- **`prisma/schema.prisma`** — the production database design (PostgreSQL). This is the real target; see below.
- **`src/types/domain.ts`** — the same hierarchy as plain TypeScript types, used by every layer above the database.
- **`src/lib/providers/`** — the marketplace adapter architecture.
  - `types.ts` defines the `TicketProvider` interface (`searchEvents`, `getEvent`, `getListings`,
    `normalizeListing`) every marketplace adapter implements.
  - `base.ts` (`BaseMockProvider`) provides the mock-mode scaffolding: `isLive()` checks whether the provider's
    required env vars are set; if not, it falls through to generated demo listings instead of failing.
  - `tickpick.ts`, `stubhub.ts`, `seatgeek.ts` — one adapter per marketplace. Each documents exactly what a live
    integration needs.
  - `registry.ts` — enable/disable + live/mock status for every provider, used by the admin panel and every data
    query. **Disabling a provider removes it everywhere immediately** — one bad integration never breaks the app.
- **`src/lib/demo-data/`** — the seed/demo dataset generator (catalog + mock listings + reconstructed price history).
  Only file that hard-codes Los Angeles/Chicago/Toronto (`catalog.ts`) — everything downstream treats cities as data.
- **`src/lib/analysis/`** — pure, framework-free business logic: price-change math, deal scoring, price-drop
  classification, inventory trend detection, and the non-predictive "Buy or Wait?" assessment. Thresholds live in
  `src/config/thresholds.config.ts` so they're tunable without touching the algorithms.
- **`src/lib/data-access/`** — the repository layer every page/API route calls. Function signatures here are shaped
  around the Prisma schema on purpose (see [Swapping in Postgres](#swapping-in-postgres)).
- **`src/components/`** — reusable UI: `CityCard`, `EventCard`, `PriceCard`, `PriceChangeBadge`, `ListingTable` /
  `ListingRow`, `DealBadge`, `AlertCard`, `PriceHistoryChart`, `InventoryChart`, `WatchCard`, `MarketplaceBadge`,
  `SeatZoneFilter`, `CitySelector`, `DateSelector`, and more.
- **`src/app/`** — Next.js App Router pages: dashboard, cities (+ add city), city detail, event detail, compare,
  watchlist, alerts, favorites, settings, admin — plus API route handlers under `src/app/api/`.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. No `.env` file is required — the app runs entirely on demo data out of the box.

## Environment variables

Copy `.env.example` to `.env.local` if/when you want to connect real infrastructure. Every variable is optional:

| Variable | Used by | Effect when unset |
| --- | --- | --- |
| `DATABASE_URL` | `prisma/schema.prisma` | App keeps using the in-memory demo data layer |
| `SEATGEEK_CLIENT_ID` / `SEATGEEK_CLIENT_SECRET` | `src/lib/providers/seatgeek.ts` | SeatGeek adapter runs in mock mode |
| `STUBHUB_CLIENT_ID` / `STUBHUB_CLIENT_SECRET` | `src/lib/providers/stubhub.ts` | StubHub adapter runs in mock mode |
| `TICKPICK_API_KEY` | `src/lib/providers/tickpick.ts` | TickPick adapter runs in mock mode |

## Connecting live marketplace APIs

Each adapter's `isLive()` flips to `true` the moment its required env vars are all set, and the app calls its
`searchEvents` / `getEvent` / `getListings` instead of generating demo listings. To wire up a real integration:

1. Get access (TickPick and StubHub require a partnership/affiliate agreement; SeatGeek's Platform API is the most
   accessible for a first integration).
2. Set the corresponding env vars.
3. Implement the `// TODO(live-api)` branch in that provider's live path (see `src/lib/providers/base.ts` for the
   pattern each adapter follows), mapping the marketplace's response onto `normalizeListing()` — the same `Listing`
   shape every other part of the app already consumes.
4. Never scrape marketplaces that don't offer an API/feed — this project intentionally does not build scraping
   infrastructure.

## Swapping in Postgres

The in-memory store (`src/lib/demo-data/store.ts`) and the data-access layer (`src/lib/data-access/`) are the only
places that know data isn't in Postgres yet. To move to real infrastructure:

```bash
# 1. Point DATABASE_URL at a real Postgres instance (Supabase or otherwise)
# 2. Generate and run the migration
npx prisma migrate dev --name init
# 3. Replace the bodies of src/lib/data-access/*.ts with Prisma queries.
#    The function signatures already match the schema, so this is a
#    mechanical swap, not a rewrite.
```

## Background refresh

Ticket data is meant to refresh periodically (`APP_CONFIG.backgroundRefreshIntervalMinutes`, default 15 minutes).
For now:

- **Development**: trigger a refresh manually from `/admin` ("Trigger Manual Refresh"), or `POST /api/refresh`.
- **Production**: wire `POST /api/refresh` to a scheduled job (cron, Vercel Cron, a queue worker — whatever fits
  your deploy target) at a frequency that respects each marketplace's API rate limits.

## Scripts

```bash
npm run dev       # start the dev server (Turbopack)
npm run build     # production build
npm run start     # run the production build
npm run lint      # ESLint
npx tsc --noEmit  # type-check
npx prisma validate   # validate prisma/schema.prisma
```

## Deployment

This is a standard Next.js App Router project — deploy it anywhere Next.js runs (Vercel, a Node host, Docker). No
database or API keys are required for the demo to work; add `DATABASE_URL` and provider credentials via your host's
environment variable settings once you're ready to move off the in-memory demo data layer.

## Product rules this codebase follows

- Never hard-code a city, venue, or tour date outside `src/lib/demo-data/catalog.ts` (or, in a real deployment, the
  database) — everything else treats them as data.
- Never present generated/mock listings as live data — see the "Demo data" badge in every listing surface.
- Every "Buy or Wait?" / insight is computed from stored data, phrased as `Trending Down` / `Up` / `Stable` /
  `High Volatility` — never a guaranteed prediction.
- "View Ticket" always links to the original marketplace listing (`listing.listingUrl`) — this app never collects
  payment information.
