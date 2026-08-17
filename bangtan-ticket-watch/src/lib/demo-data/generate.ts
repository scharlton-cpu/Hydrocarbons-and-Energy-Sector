import type { Listing, PriceSnapshot } from "@/types/domain";
import { ARTIST, CONCERT_EVENTS, SEAT_ZONES, TOUR, VENUES, CITIES } from "./catalog";
import { getEnabledProviders } from "@/lib/providers/registry";
import { buildPriceHistory } from "./price-history";

export interface GeneratedDataset {
  listings: Listing[];
  snapshotsByListingId: Map<string, PriceSnapshot[]>;
}

/**
 * Builds the full demo dataset: for every concert event, every seat zone in
 * that event's venue, and every enabled provider, generate mock listings
 * (clearly marked as demo data — see mock-generator.ts) and a plausible
 * price history for each. This is the ONE place mock listings get created;
 * the in-memory store (store.ts) just holds the result.
 */
export function generateDataset(now: Date = new Date()): GeneratedDataset {
  const listings: Listing[] = [];
  const snapshotsByListingId = new Map<string, PriceSnapshot[]>();

  const venueById = new Map(VENUES.map((v) => [v.id, v]));
  const cityById = new Map(CITIES.map((c) => [c.id, c]));

  for (const event of CONCERT_EVENTS) {
    const venue = venueById.get(event.venueId);
    const city = cityById.get(event.cityId);
    if (!venue || !city) continue;

    const zones = SEAT_ZONES.filter((z) => z.venueId === venue.id);

    for (const zone of zones) {
      for (const provider of getEnabledProviders()) {
        const rawListings = provider.generateMockNormalizedListings(
          {
            concertEventId: event.id,
            seatZoneId: zone.id,
            seatZoneName: zone.name,
            seatZoneCategory: zone.category,
            artist: ARTIST.name,
            tour: TOUR.name,
            city: city.name,
            venue: venue.name,
            concertDate: event.date,
            currency: event.currency,
            seedKey: `${event.id}-${zone.id}`,
          },
          now.toISOString()
        );

        for (const listing of rawListings) {
          const { snapshots, firstSeenAt, lastPriceChangeAt } = buildPriceHistory(listing, now);
          const finalListing: Listing = { ...listing, firstSeenAt, lastPriceChangeAt };
          listings.push(finalListing);
          snapshotsByListingId.set(listing.listingId, snapshots);
        }
      }
    }
  }

  return { listings, snapshotsByListingId };
}
