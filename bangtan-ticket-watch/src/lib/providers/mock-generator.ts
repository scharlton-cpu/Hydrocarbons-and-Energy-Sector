import type { Currency, Listing, ProviderId, SeatZoneCategory } from "@/types/domain";

/**
 * Deterministic pseudo-random generator shared by every provider adapter's
 * mock mode, and by the demo-data seed script. Deterministic (mulberry32)
 * so re-running the seed produces stable, reproducible demo data instead of
 * different numbers on every dev-server restart.
 *
 * IMPORTANT: this file produces DEMONSTRATION data only. It must never be
 * used, or mistaken for, a live marketplace response — every listing it
 * creates carries a `listingUrl` pointing at a clearly fake path, and
 * callers are expected to label the UI accordingly (see the "Demo data"
 * badge in MarketplaceBadge).
 */

export function mulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashStringToSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (Math.imul(31, hash) + input.charCodeAt(i)) | 0;
  }
  return hash;
}

interface ProviderPricingProfile {
  /** Base multiplier applied to the zone's reference price. */
  priceBias: number;
  feeRate: number;
  listingCountRange: [number, number];
}

export const PROVIDER_PRICING_PROFILES: Record<ProviderId, ProviderPricingProfile> = {
  tickpick: { priceBias: 0.94, feeRate: 0.0, listingCountRange: [5, 13] }, // "no buyer fees" positioning
  stubhub: { priceBias: 1.05, feeRate: 0.22, listingCountRange: [7, 17] },
  seatgeek: { priceBias: 1.0, feeRate: 0.18, listingCountRange: [4, 11] },
};

const ZONE_REFERENCE_PRICE: Record<SeatZoneCategory, number> = {
  floor: 1400,
  lower_bowl: 850,
  club: 1050,
  upper_level: 380,
  other: 500,
};

export interface MockListingSeed {
  provider: ProviderId;
  concertEventId: string;
  seatZoneId: string;
  seatZoneName: string;
  seatZoneCategory: SeatZoneCategory;
  artist: string;
  tour: string;
  city: string;
  venue: string;
  concertDate: string;
  currency: Currency;
  /** Distinguishes venues/dates/zones so different combinations don't collide. */
  seedKey: string;
}

/** Generates a batch of mock listings for one provider + seat zone + event. */
export function generateMockListings(seed: MockListingSeed, now: string): Listing[] {
  const profile = PROVIDER_PRICING_PROFILES[seed.provider];
  const rng = mulberry32(hashStringToSeed(`${seed.provider}:${seed.seedKey}`));
  const [minCount, maxCount] = profile.listingCountRange;
  const count = Math.floor(minCount + rng() * (maxCount - minCount));
  const referencePrice = ZONE_REFERENCE_PRICE[seed.seatZoneCategory];

  const listings: Listing[] = [];
  for (let i = 0; i < count; i++) {
    const spread = 0.55 + rng() * 1.1; // spread listings from ~55% to ~165% of reference
    const basePrice = round2(referencePrice * profile.priceBias * spread);
    const fees = round2(basePrice * profile.feeRate);
    const allInPrice = round2(basePrice + fees);
    const rowNum = seed.seatZoneCategory === "floor" ? 1 + Math.floor(rng() * 30) : 1 + Math.floor(rng() * 40);
    const listingId = `${seed.provider}-${seed.seedKey}-${i}`;

    listings.push({
      listingId,
      provider: seed.provider,
      providerEventId: `${seed.provider}-evt-${hashStringToSeed(seed.seedKey)}`,
      concertEventId: seed.concertEventId,
      seatZoneId: seed.seatZoneId,
      artist: seed.artist,
      tour: seed.tour,
      city: seed.city,
      venue: seed.venue,
      concertDate: seed.concertDate,
      section: seed.seatZoneName,
      row: `Row ${rowNum}`,
      seatType: seed.seatZoneCategory,
      quantity: 1 + Math.floor(rng() * 4),
      basePrice,
      fees,
      allInPrice,
      currency: seed.currency,
      listingUrl: `https://demo.${seed.provider}.example/listing/${listingId}`,
      available: true,
      firstSeenAt: now,
      lastSeenAt: now,
      lastPriceChangeAt: now,
    });
  }
  return listings;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
