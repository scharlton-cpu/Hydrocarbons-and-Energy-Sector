import { getStore } from "@/lib/demo-data/store";
import { median, average } from "@/lib/analysis/price-change";
import type { SeatZoneCategory } from "@/types/domain";

export type ChartTimeFilter = "24h" | "3d" | "7d" | "14d" | "30d" | "all";

const WINDOW_HOURS: Record<ChartTimeFilter, number> = {
  "24h": 24,
  "3d": 72,
  "7d": 168,
  "14d": 336,
  "30d": 720,
  all: Infinity,
};

export interface PriceSeriesPoint {
  timestamp: string;
  low: number;
  median: number;
  average: number;
  inventory: number;
}

/**
 * Groups every listing's price snapshots by their (shared) capture
 * timestamp and aggregates low/median/average/inventory per point. All
 * demo listings are generated against the same timestamp grid (see
 * src/lib/demo-data/price-history.ts), so grouping by exact `capturedAt`
 * is equivalent to an "as of" reconstruction without the extra work.
 */
export function getPriceSeriesForEvent(
  eventId: string,
  opts: { seatZoneCategories?: SeatZoneCategory[]; filter?: ChartTimeFilter; now?: Date } = {}
): PriceSeriesPoint[] {
  const store = getStore();
  const now = opts.now ?? new Date();
  const filter = opts.filter ?? "7d";
  const windowMs = WINDOW_HOURS[filter] * 60 * 60 * 1000;
  const cutoff = Number.isFinite(windowMs) ? now.getTime() - windowMs : -Infinity;

  const listings = store.listings.filter(
    (l) => l.concertEventId === eventId && (!opts.seatZoneCategories?.length || opts.seatZoneCategories.includes(l.seatType))
  );

  const byTimestamp = new Map<string, number[]>();
  for (const listing of listings) {
    const snapshots = store.snapshotsByListingId.get(listing.listingId) ?? [];
    for (const snap of snapshots) {
      if (new Date(snap.capturedAt).getTime() < cutoff) continue;
      const arr = byTimestamp.get(snap.capturedAt) ?? [];
      arr.push(snap.allInPrice);
      byTimestamp.set(snap.capturedAt, arr);
    }
  }

  return Array.from(byTimestamp.entries())
    .map(([timestamp, prices]) => ({
      timestamp,
      low: Math.min(...prices),
      median: median(prices),
      average: average(prices),
      inventory: prices.length,
    }))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}
