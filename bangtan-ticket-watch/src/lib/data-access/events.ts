import { getStore } from "@/lib/demo-data/store";
import { buildListingViewsForEvent } from "./listing-view";
import type { EventDateSummaryView, ListingFilters, ListingSortKey, ListingView } from "./view-types";
import type { ConcertEvent, Venue } from "@/types/domain";

export interface EventDetail {
  event: ConcertEvent;
  venue: Venue;
  cityName: string;
  citySlug: string;
}

export function getEventDetail(eventId: string): EventDetail | null {
  const store = getStore();
  const event = store.events.find((e) => e.id === eventId);
  if (!event) return null;
  const venue = store.venues.find((v) => v.id === event.venueId);
  const city = store.cities.find((c) => c.id === event.cityId);
  if (!venue || !city) return null;
  return { event, venue, cityName: city.name, citySlug: city.slug };
}

export function getDateComparisonForCity(cityId: string): EventDateSummaryView[] {
  const store = getStore();
  const venue = store.venues.find((v) => v.cityId === cityId);
  const floorZoneIds = new Set(store.seatZones.filter((z) => venue && z.venueId === venue.id && z.category === "floor").map((z) => z.id));
  const events = store.events.filter((e) => e.cityId === cityId).sort((a, b) => a.date.localeCompare(b.date));

  return events.map((event) => {
    const listings = store.listings.filter((l) => l.concertEventId === event.id && l.available && floorZoneIds.has(l.seatZoneId));
    const prices = listings.map((l) => l.allInPrice);
    return {
      eventId: event.id,
      date: event.date,
      lowestFloor: prices.length ? Math.min(...prices) : null,
      averageFloor: prices.length ? Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100 : null,
      inventoryCount: listings.length,
    };
  });
}

export function bestDateForFloor(summaries: EventDateSummaryView[]): EventDateSummaryView | null {
  const withPrices = summaries.filter((s) => s.lowestFloor !== null);
  if (withPrices.length === 0) return null;
  return withPrices.reduce((best, s) => (s.lowestFloor! < best.lowestFloor! ? s : best), withPrices[0]);
}

export function getEventListingViews(
  eventId: string,
  filters: ListingFilters = {},
  sort: ListingSortKey = "lowest_price",
  now: Date = new Date()
): ListingView[] {
  let views = buildListingViewsForEvent(eventId, now);
  views = applyFilters(views, filters);
  return sortListingViews(views, sort);
}

export function applyFilters(views: ListingView[], filters: ListingFilters): ListingView[] {
  let result = views;

  if (filters.quickFilter === "floor_only") {
    result = result.filter((v) => v.listing.seatType === "floor");
  } else if (filters.quickFilter === "price_drops") {
    result = result.filter((v) => v.dropClassification.level !== "none");
  } else if (filters.quickFilter === "new_listings") {
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    result = result.filter((v) => new Date(v.listing.firstSeenAt).getTime() >= dayAgo);
  } else if (filters.quickFilter === "under_target" && filters.targetPrice !== undefined) {
    result = result.filter((v) => v.listing.allInPrice <= filters.targetPrice!);
  }

  if (filters.seatZoneCategories && filters.seatZoneCategories.length > 0) {
    result = result.filter((v) => filters.seatZoneCategories!.includes(v.listing.seatType));
  }
  if (filters.providers && filters.providers.length > 0) {
    result = result.filter((v) => filters.providers!.includes(v.listing.provider));
  }
  if (filters.section) {
    result = result.filter((v) => v.listing.section === filters.section);
  }
  if (filters.minPrice !== undefined) {
    result = result.filter((v) => v.listing.allInPrice >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    result = result.filter((v) => v.listing.allInPrice <= filters.maxPrice!);
  }
  if (filters.minDropPercent !== undefined) {
    result = result.filter((v) => {
      const pct = v.priceChange?.percentChange7d ?? v.priceChange?.percentChange ?? 0;
      return -pct >= filters.minDropPercent!;
    });
  }
  if (filters.dealRating && filters.dealRating.length > 0) {
    result = result.filter((v) => filters.dealRating!.includes(v.dealScore.rating));
  }

  return result;
}

export function sortListingViews(views: ListingView[], sort: ListingSortKey): ListingView[] {
  const arr = [...views];
  switch (sort) {
    case "lowest_price":
      return arr.sort((a, b) => a.listing.allInPrice - b.listing.allInPrice);
    case "biggest_drop":
      return arr.sort((a, b) => (a.priceChange?.percentChange7d ?? 0) - (b.priceChange?.percentChange7d ?? 0));
    case "section":
      return arr.sort((a, b) => a.listing.section.localeCompare(b.listing.section));
    case "marketplace":
      return arr.sort((a, b) => a.listing.provider.localeCompare(b.listing.provider));
    case "newest":
      return arr.sort((a, b) => new Date(b.listing.firstSeenAt).getTime() - new Date(a.listing.firstSeenAt).getTime());
    case "recently_changed":
      return arr.sort((a, b) => new Date(b.listing.lastPriceChangeAt).getTime() - new Date(a.listing.lastPriceChangeAt).getTime());
    case "best_deal":
      return arr.sort((a, b) => b.dealScore.percentBelowMedian - a.dealScore.percentBelowMedian);
    default:
      return arr;
  }
}
