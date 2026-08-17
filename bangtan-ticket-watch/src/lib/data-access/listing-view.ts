import type { Listing } from "@/types/domain";
import { getStore } from "@/lib/demo-data/store";
import { summarizePriceHistory } from "@/lib/analysis/price-change";
import { scoreDeal } from "@/lib/analysis/deal-score";
import { classifyPriceDrop } from "@/lib/analysis/price-drop";
import type { ListingView } from "./view-types";

/**
 * Builds the fully-computed view model for one listing. `comparableListings`
 * should be every other listing in the same seat zone for the same concert
 * event — the deal-score comparison group.
 */
export function buildListingView(listing: Listing, comparableListings: Listing[], now: Date): ListingView {
  const store = getStore();
  const snapshots = store.snapshotsByListingId.get(listing.listingId) ?? [];
  const priceChange = summarizePriceHistory(snapshots, now);
  const dealScore = scoreDeal(
    listing.allInPrice,
    comparableListings.filter((l) => l.listingId !== listing.listingId).map((l) => l.allInPrice)
  );
  const dropClassification = classifyPriceDrop(priceChange?.percentChange7d ?? priceChange?.percentChange ?? null);

  return { listing, priceChange, dealScore, dropClassification };
}

export function buildListingViewsForEvent(eventId: string, now: Date = new Date()): ListingView[] {
  const store = getStore();
  const eventListings = store.listings.filter((l) => l.concertEventId === eventId && l.available);
  const bySeatZone = new Map<string, Listing[]>();
  for (const l of eventListings) {
    const arr = bySeatZone.get(l.seatZoneId) ?? [];
    arr.push(l);
    bySeatZone.set(l.seatZoneId, arr);
  }
  return eventListings.map((l) => buildListingView(l, bySeatZone.get(l.seatZoneId) ?? [], now));
}
