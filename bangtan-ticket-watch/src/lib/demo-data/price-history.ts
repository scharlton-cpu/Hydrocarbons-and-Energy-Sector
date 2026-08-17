import type { Listing, PriceSnapshot } from "@/types/domain";
import { mulberry32, hashStringToSeed, round2 } from "@/lib/providers/mock-generator";

const HISTORY_DAYS = 21;

/**
 * Builds a plausible price history ending at `listing.allInPrice` (the
 * "current" price) and returns the reconstructed earlier listing state
 * (firstSeenAt / initial price) alongside the snapshot list. Walks
 * *backward* from now so the most recent, most-referenced price is exactly
 * what the listing already shows — no drift between "current price" shown
 * on cards and the last history point.
 */
export function buildPriceHistory(
  listing: Listing,
  now: Date
): { snapshots: PriceSnapshot[]; firstSeenAt: string; lastPriceChangeAt: string } {
  const rng = mulberry32(hashStringToSeed(`history:${listing.listingId}`));

  // Slight downward drift bias overall (resale prices commonly soften as a
  // show approaches, once initial excitement demand is absorbed), with
  // day-to-day noise so it doesn't look artificial.
  const driftPerDay = -0.004 - rng() * 0.01; // -0.4% to -1.4% / day drift
  const noiseStd = 0.02 + rng() * 0.02;

  // Some listings simply haven't existed the whole window — simulate that.
  const listingAgeDays = rng() < 0.3 ? 1 + Math.floor(rng() * (HISTORY_DAYS - 2)) : HISTORY_DAYS;

  const points: { at: Date; price: number }[] = [];
  let price = listing.allInPrice;

  // Walk backward one point per day for the full window, then thin to the
  // listing's actual age.
  const dailyPrices: number[] = [price];
  for (let d = 1; d <= HISTORY_DAYS; d++) {
    const noise = (rng() - 0.5) * 2 * noiseStd;
    const prevPrice = price / (1 + driftPerDay + noise);
    price = Math.max(prevPrice, 40);
    dailyPrices.push(round2(price));
  }
  dailyPrices.reverse(); // oldest -> newest, last entry === listing.allInPrice at index HISTORY_DAYS

  const startIndex = HISTORY_DAYS - (listingAgeDays - 1);
  for (let i = startIndex; i <= HISTORY_DAYS; i++) {
    const daysAgo = HISTORY_DAYS - i;
    const at = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    points.push({ at, price: dailyPrices[i] });
  }

  // Add finer-grained points across the last 48h so "24-hour change" isn't
  // just two flat daily buckets.
  const recentExtra = [18, 12, 6].map((hoursAgo) => {
    const at = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    const basePrice = dailyPrices[HISTORY_DAYS];
    const wiggle = 1 + (rng() - 0.5) * 0.03;
    return { at, price: round2(basePrice * wiggle) };
  });
  points.push(...recentExtra);
  points.sort((a, b) => a.at.getTime() - b.at.getTime());
  points[points.length - 1] = { at: now, price: listing.allInPrice };

  const feeRate = listing.fees / Math.max(listing.basePrice, 1);
  const snapshots: PriceSnapshot[] = points.map((p, idx) => ({
    id: `${listing.listingId}-snap-${idx}`,
    listingId: listing.listingId,
    price: round2(p.price / (1 + feeRate)),
    allInPrice: p.price,
    available: true,
    capturedAt: p.at.toISOString(),
  }));

  let lastPriceChangeAt = snapshots[0]?.capturedAt ?? now.toISOString();
  for (let i = 1; i < snapshots.length; i++) {
    if (snapshots[i].allInPrice !== snapshots[i - 1].allInPrice) {
      lastPriceChangeAt = snapshots[i].capturedAt;
    }
  }

  return {
    snapshots,
    firstSeenAt: snapshots[0]?.capturedAt ?? now.toISOString(),
    lastPriceChangeAt,
  };
}
