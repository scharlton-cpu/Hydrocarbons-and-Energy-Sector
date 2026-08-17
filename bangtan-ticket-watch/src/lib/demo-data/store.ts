import type { AlertEvent, AlertRule, Favorite, Listing, PriceSnapshot, ProviderId, Watch } from "@/types/domain";
import { ARTIST, CITIES, CONCERT_EVENTS, SEAT_ZONES, TOUR, VENUES } from "./catalog";
import { generateDataset } from "./generate";
import { getEnabledProviders } from "@/lib/providers/registry";
import { mulberry32, hashStringToSeed, round2 } from "@/lib/providers/mock-generator";

export interface ProviderSyncLogEntry {
  providerId: ProviderId;
  syncedAt: string;
  status: "ok" | "error" | "unavailable";
  listingCount: number;
  error?: string;
}

/**
 * Process-lifetime in-memory "database" for the MVP. A future swap to
 * Prisma/Postgres replaces this module's exports with real queries — see
 * prisma/schema.prisma and src/lib/data-access for the shape this mirrors.
 * Mutations (watches, alerts, favorites) are held in plain arrays and reset
 * whenever the server process restarts; that's an accepted limitation of
 * running without infrastructure, documented in README.md.
 */
class DemoStore {
  readonly generatedAt = new Date();
  readonly artist = ARTIST;
  readonly tour = TOUR;
  readonly cities = CITIES;
  readonly venues = VENUES;
  readonly seatZones = SEAT_ZONES;
  readonly events = CONCERT_EVENTS;

  listings: Listing[];
  snapshotsByListingId: Map<string, PriceSnapshot[]>;

  watches: Watch[] = [];
  alertRules: AlertRule[] = [];
  alertEvents: AlertEvent[] = [];
  favorites: Favorite[] = [];

  lastRefreshAt: string | null = null;
  providerSyncLog: ProviderSyncLogEntry[] = [];

  constructor() {
    const { listings, snapshotsByListingId } = generateDataset(this.generatedAt);
    this.listings = listings;
    this.snapshotsByListingId = snapshotsByListingId;
    this.seedWatchesAndAlerts();
  }

  /**
   * Simulates what a scheduled background refresh job would do: re-poll
   * every enabled provider and record a new price point per listing. Real
   * production code would call each TicketProvider's getListings() here;
   * in mock mode we nudge prices with a small random walk so "manual
   * refresh" is visibly doing something in the admin panel and dashboard.
   */
  refresh(now: Date = new Date()): ProviderSyncLogEntry[] {
    const enabledIds = new Set(getEnabledProviders().map((p) => p.id));
    const countByProvider = new Map<ProviderId, number>();

    for (const listing of this.listings) {
      if (!enabledIds.has(listing.provider)) continue;
      countByProvider.set(listing.provider, (countByProvider.get(listing.provider) ?? 0) + 1);

      const rng = mulberry32(hashStringToSeed(`refresh:${listing.listingId}:${now.getTime()}`));
      const wiggle = 1 + (rng() - 0.5) * 0.06; // +/-3%
      const newAllIn = round2(listing.allInPrice * wiggle);
      const feeRate = listing.fees / Math.max(listing.basePrice, 1);
      listing.basePrice = round2(newAllIn / (1 + feeRate));
      listing.fees = round2(newAllIn - listing.basePrice);
      const changed = newAllIn !== listing.allInPrice;
      listing.allInPrice = newAllIn;
      listing.lastSeenAt = now.toISOString();
      if (changed) listing.lastPriceChangeAt = now.toISOString();

      const snapshots = this.snapshotsByListingId.get(listing.listingId) ?? [];
      snapshots.push({
        id: `${listing.listingId}-snap-${snapshots.length}`,
        listingId: listing.listingId,
        price: listing.basePrice,
        allInPrice: listing.allInPrice,
        available: listing.available,
        capturedAt: now.toISOString(),
      });
      this.snapshotsByListingId.set(listing.listingId, snapshots);
    }

    this.providerSyncLog = getEnabledProviders().map((p) => ({
      providerId: p.id,
      syncedAt: now.toISOString(),
      status: "ok" as const,
      listingCount: countByProvider.get(p.id) ?? 0,
    }));
    this.lastRefreshAt = now.toISOString();
    return this.providerSyncLog;
  }

  private seedWatchesAndAlerts() {
    const laFloor: Watch = {
      id: "watch-la-floor",
      userId: "demo-user",
      name: "LA Floor Hunt",
      cityId: "city-la",
      concertEventIds: "all",
      seatZoneCategories: ["floor"],
      quantity: 1,
      maxPrice: 1200,
      currency: "USD",
      status: "active",
      createdAt: new Date(this.generatedAt.getTime() - 6 * 86400000).toISOString(),
    };
    const chiFloorLower: Watch = {
      id: "watch-chi-floor-lower",
      userId: "demo-user",
      name: "Chicago Floor + Lower Bowl",
      cityId: "city-chi",
      concertEventIds: "all",
      seatZoneCategories: ["floor", "lower_bowl"],
      quantity: 2,
      maxPrice: 1000,
      currency: "USD",
      status: "active",
      createdAt: new Date(this.generatedAt.getTime() - 3 * 86400000).toISOString(),
    };
    this.watches = [laFloor, chiFloorLower];

    this.alertRules = [
      {
        id: "alert-rule-la-below-1200",
        userId: "demo-user",
        watchId: laFloor.id,
        cityId: "city-la",
        seatZoneCategory: "floor",
        type: "price_below",
        thresholdPrice: 1200,
        active: true,
        createdAt: laFloor.createdAt,
      },
      {
        id: "alert-rule-any-15pct",
        userId: "demo-user",
        type: "percent_drop",
        thresholdPercent: 15,
        active: true,
        createdAt: laFloor.createdAt,
      },
    ];
  }
}

/**
 * Next.js compiles each route (every page and every API route handler)
 * into its own separate server bundle. A plain module-level `let`
 * singleton gets a fresh, independent copy in every one of those bundles,
 * so a watch created via a POST to /api/watches would silently vanish when
 * a page in a different bundle called getStore() next. Caching on
 * `globalThis` instead works because it's the one thing every bundle
 * genuinely shares — the same Node.js process's global object — which is
 * also why this is the same pattern used for e.g. a shared Prisma Client.
 */
const globalForStore = globalThis as unknown as { __demoStore?: DemoStore };

export function getStore(): DemoStore {
  if (!globalForStore.__demoStore) {
    globalForStore.__demoStore = new DemoStore();
  }
  return globalForStore.__demoStore;
}

export type { DemoStore };
