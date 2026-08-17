import { getStore } from "@/lib/demo-data/store";
import { summarizePriceHistory } from "@/lib/analysis/price-change";
import { summarizeInventory } from "@/lib/analysis/inventory";
import { assessBuyOrWait, type BuyOrWaitAssessment } from "@/lib/analysis/buy-or-wait";

export function getBuyOrWaitForCity(citySlug: string, now: Date = new Date()): BuyOrWaitAssessment | null {
  const store = getStore();
  const city = store.cities.find((c) => c.slug === citySlug);
  if (!city) return null;

  const venue = store.venues.find((v) => v.cityId === city.id);
  const floorZoneIds = new Set(store.seatZones.filter((z) => venue && z.venueId === venue.id && z.category === "floor").map((z) => z.id));
  const eventIds = new Set(store.events.filter((e) => e.cityId === city.id).map((e) => e.id));
  const floorListings = store.listings.filter((l) => eventIds.has(l.concertEventId) && floorZoneIds.has(l.seatZoneId) && l.available);

  const currentPrices = floorListings.map((l) => l.allInPrice);
  const price7dAgoValues: number[] = [];
  for (const l of floorListings) {
    const summary = summarizePriceHistory(store.snapshotsByListingId.get(l.listingId) ?? [], now);
    if (summary && summary.percentChange7d !== null) {
      price7dAgoValues.push(Math.round((l.allInPrice / (1 + summary.percentChange7d / 100)) * 100) / 100);
    }
  }

  const inventory = summarizeInventory(floorListings, now);
  return assessBuyOrWait(currentPrices, price7dAgoValues, inventory, `${city.name} floor`);
}
