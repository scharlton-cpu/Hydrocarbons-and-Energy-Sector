import { getStore } from "@/lib/demo-data/store";
import { summarizePriceHistory, median, average } from "@/lib/analysis/price-change";
import { summarizeInventory } from "@/lib/analysis/inventory";
import { buildListingView, buildListingViewsForEvent } from "./listing-view";
import type { CitySummaryView, CityStatusInfo, ListingView } from "./view-types";
import type { City, ConcertEvent, Listing, SeatZone, Venue } from "@/types/domain";
import { getEnabledProviders } from "@/lib/providers/registry";
import { buildPriceHistory } from "@/lib/demo-data/price-history";

function computeCityStatus(percentChange7d: number | null, percentChange24h: number | null, isLowInventory: boolean): CityStatusInfo {
  if (isLowInventory) return { status: "low_inventory", label: "Low Inventory", icon: "⚠️" };
  const ref = percentChange7d ?? percentChange24h ?? 0;
  if (ref <= -12) return { status: "dropping", label: "Prices Dropping", icon: "🔥" };
  if (ref <= -5) return { status: "good_buying_zone", label: "Good Buying Zone", icon: "🟢" };
  if (ref >= 8) return { status: "rising", label: "Rising", icon: "🔴" };
  return { status: "stable", label: "Stable", icon: "🟡" };
}

export function getCitySummary(citySlug: string, now: Date = new Date()): CitySummaryView | null {
  const store = getStore();
  const city = store.cities.find((c) => c.slug === citySlug);
  if (!city) return null;
  return summarizeCity(city, now);
}

export function getAllCitySummaries(now: Date = new Date()): CitySummaryView[] {
  const store = getStore();
  return store.cities.map((c) => summarizeCity(c, now));
}

function summarizeCity(city: City, now: Date): CitySummaryView {
  const store = getStore();
  const events = store.events.filter((e) => e.cityId === city.id);
  const venue = store.venues.find((v) => v.id === events[0]?.venueId) ?? store.venues.find((v) => v.cityId === city.id);
  const eventIds = new Set(events.map((e) => e.id));
  const floorZoneIds = new Set(store.seatZones.filter((z) => venue && z.venueId === venue.id && z.category === "floor").map((z) => z.id));

  const cityListings = store.listings.filter((l) => eventIds.has(l.concertEventId) && l.available);
  const floorListings = cityListings.filter((l) => floorZoneIds.has(l.seatZoneId));

  const floorPrices = floorListings.map((l) => l.allInPrice);
  const lowestFloor = floorPrices.length ? Math.min(...floorPrices) : null;
  const averageFloor = floorPrices.length ? average(floorPrices) : null;
  const medianFloor = floorPrices.length ? median(floorPrices) : null;

  const floorChanges = floorListings
    .map((l) => summarizePriceHistory(store.snapshotsByListingId.get(l.listingId) ?? [], now))
    .filter((s): s is NonNullable<typeof s> => s !== null);

  const percentChange24h = floorChanges.length
    ? median(floorChanges.map((c) => c.percentChange24h).filter((n): n is number => n !== null))
    : null;
  const percentChange7d = floorChanges.length
    ? median(floorChanges.map((c) => c.percentChange7d).filter((n): n is number => n !== null))
    : null;

  const inventory = summarizeInventory(floorListings, now);
  const listingsWithDrops = floorChanges.filter((c) => c.percentChange7d !== null && c.percentChange7d <= -5).length;

  let bestDeal: ListingView | null = null;
  if (floorListings.length > 0) {
    const views = floorListings.map((l) => buildListingView(l, floorListings, now));
    bestDeal = views.reduce((best, v) => (v.dealScore.percentBelowMedian > best.dealScore.percentBelowMedian ? v : best), views[0]);
  }

  const status = computeCityStatus(percentChange7d, percentChange24h, inventory.isLow);

  return {
    citySlug: city.slug,
    cityName: city.name,
    country: city.country,
    currency: events[0]?.currency ?? "USD",
    venueName: venue?.name ?? "TBA",
    dateCount: events.length,
    dates: events.map((e) => e.date).sort(),
    lowestFloor,
    averageFloor,
    medianFloor,
    percentChange24h,
    percentChange7d,
    inventoryCount: cityListings.length,
    newListings: inventory.newLast24h,
    listingsWithDrops,
    bestDeal,
    status,
  };
}

export function getCityListingViews(citySlug: string, now: Date = new Date()) {
  const catalog = getCityCatalog(citySlug);
  if (!catalog) return [];
  const views: ListingView[] = [];
  for (const event of catalog.events) {
    views.push(...buildListingViewsForEvent(event.id, now));
  }
  return views;
}

export interface CityCatalog {
  city: City;
  venue: Venue | undefined;
  events: ConcertEvent[];
  seatZones: SeatZone[];
}

export function getCityCatalog(citySlug: string): CityCatalog | null {
  const store = getStore();
  const city = store.cities.find((c) => c.slug === citySlug);
  if (!city) return null;
  const events = store.events.filter((e) => e.cityId === city.id).sort((a, b) => a.date.localeCompare(b.date));
  const venue = store.venues.find((v) => v.cityId === city.id);
  const seatZones = venue ? store.seatZones.filter((z) => z.venueId === venue.id) : [];
  return { city, venue, events, seatZones };
}

export interface AddCityInput {
  artistName?: string;
  city: string;
  country: string;
  venue: string;
  address?: string;
  timezone?: string;
  dates: string[];
  currency: "USD" | "CAD" | "EUR" | "GBP";
  seatingAreas: { name: string; category: "floor" | "lower_bowl" | "club" | "upper_level" | "other" }[];
  targetPrice?: number;
  ticketsNeeded?: number;
  providers?: Array<"tickpick" | "stubhub" | "seatgeek">;
}

export function addCity(input: AddCityInput): CityCatalog {
  const store = getStore();
  const slug = slugify(input.city);
  const cityId = `city-${slug}-${Date.now().toString(36)}`;
  const city: City = {
    id: cityId,
    tourId: store.tour.id,
    slug,
    name: input.city,
    country: input.country,
    timezone: input.timezone || "America/New_York",
  };
  const venueId = `venue-${slug}-${Date.now().toString(36)}`;
  const venue: Venue = { id: venueId, cityId, name: input.venue, address: input.address };

  const seatZones: SeatZone[] = input.seatingAreas.map((z, i) => ({
    id: `sz-${slug}-${i}-${Date.now().toString(36)}`,
    venueId,
    name: z.name,
    category: z.category,
  }));

  const events: ConcertEvent[] = input.dates.map((date, i) => ({
    id: `evt-${slug}-${i}-${Date.now().toString(36)}`,
    venueId,
    cityId,
    date,
    currency: input.currency,
  }));

  store.cities.push(city);
  store.venues.push(venue);
  store.seatZones.push(...seatZones);
  store.events.push(...events);

  // Generate mock listings + price history immediately so the city is
  // usable right away, same as the seed data.
  generateListingsForNewEvents(events, seatZones, input);

  return { city, venue, events, seatZones };
}

function generateListingsForNewEvents(
  events: ConcertEvent[],
  seatZones: SeatZone[],
  input: AddCityInput
) {
  const store = getStore();
  const providerAllowList = input.providers && input.providers.length > 0 ? new Set(input.providers) : null;
  const now = store.generatedAt;

  for (const event of events) {
    for (const zone of seatZones) {
      for (const provider of getEnabledProviders()) {
        if (providerAllowList && !providerAllowList.has(provider.id)) continue;
        const rawListings: Listing[] = provider.generateMockNormalizedListings(
          {
            concertEventId: event.id,
            seatZoneId: zone.id,
            seatZoneName: zone.name,
            seatZoneCategory: zone.category,
            artist: input.artistName || store.artist.name,
            tour: store.tour.name,
            city: input.city,
            venue: input.venue,
            concertDate: event.date,
            currency: input.currency,
            seedKey: `${event.id}-${zone.id}`,
          },
          now.toISOString()
        );
        for (const listing of rawListings) {
          const { snapshots, firstSeenAt, lastPriceChangeAt } = buildPriceHistory(listing, now);
          const finalListing: Listing = { ...listing, firstSeenAt, lastPriceChangeAt };
          store.listings.push(finalListing);
          store.snapshotsByListingId.set(listing.listingId, snapshots);
        }
      }
    }
  }
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
