import type { Artist, City, ConcertEvent, SeatZone, Tour, Venue } from "@/types/domain";

/**
 * Static catalog for the demo/seed data: Artist -> Tour -> City -> Venue ->
 * Event -> SeatZone. This is the ONLY file that should ever name a specific
 * city, venue, or date — everything downstream (generators, data-access,
 * UI) treats these as data, never as hard-coded branches. Adding a new city
 * means adding an entry here (or, in the real app, a row via the Add City
 * workflow / admin panel) — nothing else changes.
 */

function daysFromNow(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export const ARTIST: Artist = {
  id: "artist-bts",
  slug: "bts",
  name: "BTS",
};

export const TOUR: Tour = {
  id: "tour-2027",
  artistId: ARTIST.id,
  slug: "world-tour-2027",
  name: "BTS World Tour 2027",
};

export const CITIES: City[] = [
  {
    id: "city-la",
    tourId: TOUR.id,
    slug: "los-angeles",
    name: "Los Angeles",
    country: "USA",
    timezone: "America/Los_Angeles",
  },
  {
    id: "city-chi",
    tourId: TOUR.id,
    slug: "chicago",
    name: "Chicago",
    country: "USA",
    timezone: "America/Chicago",
  },
  {
    id: "city-tor",
    tourId: TOUR.id,
    slug: "toronto",
    name: "Toronto",
    country: "Canada",
    timezone: "America/Toronto",
  },
];

export const VENUES: Venue[] = [
  { id: "venue-la", cityId: "city-la", name: "SoFi Stadium", address: "1001 Stadium Dr, Inglewood, CA" },
  { id: "venue-chi", cityId: "city-chi", name: "United Center", address: "1901 W Madison St, Chicago, IL" },
  { id: "venue-tor", cityId: "city-tor", name: "Rogers Centre", address: "1 Blue Jays Way, Toronto, ON" },
];

export const SEAT_ZONES: SeatZone[] = [
  // SoFi Stadium (LA)
  { id: "sz-la-floor-a", venueId: "venue-la", name: "Floor A", category: "floor" },
  { id: "sz-la-floor-b", venueId: "venue-la", name: "Floor B", category: "floor" },
  { id: "sz-la-floor-c", venueId: "venue-la", name: "Floor C", category: "floor" },
  { id: "sz-la-lower-100", venueId: "venue-la", name: "Lower Level 100s", category: "lower_bowl" },
  { id: "sz-la-club", venueId: "venue-la", name: "Club Level", category: "club" },
  { id: "sz-la-upper-300", venueId: "venue-la", name: "Upper Level 300s", category: "upper_level" },

  // United Center (Chicago)
  { id: "sz-chi-floor-1", venueId: "venue-chi", name: "Floor 1", category: "floor" },
  { id: "sz-chi-floor-2", venueId: "venue-chi", name: "Floor 2", category: "floor" },
  { id: "sz-chi-lower-100", venueId: "venue-chi", name: "Lower Bowl 100s", category: "lower_bowl" },
  { id: "sz-chi-upper-300", venueId: "venue-chi", name: "Upper Level 300s", category: "upper_level" },

  // Rogers Centre (Toronto)
  { id: "sz-tor-floor-a", venueId: "venue-tor", name: "Floor A", category: "floor" },
  { id: "sz-tor-floor-b", venueId: "venue-tor", name: "Floor B", category: "floor" },
  { id: "sz-tor-100", venueId: "venue-tor", name: "100 Level", category: "lower_bowl" },
  { id: "sz-tor-club-200", venueId: "venue-tor", name: "200 Level Club", category: "club" },
  { id: "sz-tor-500", venueId: "venue-tor", name: "500 Level", category: "upper_level" },
];

export const CONCERT_EVENTS: ConcertEvent[] = [
  { id: "evt-la-1", venueId: "venue-la", cityId: "city-la", date: daysFromNow(38), currency: "USD" },
  { id: "evt-la-2", venueId: "venue-la", cityId: "city-la", date: daysFromNow(39), currency: "USD" },
  { id: "evt-la-3", venueId: "venue-la", cityId: "city-la", date: daysFromNow(42), currency: "USD" },
  { id: "evt-la-4", venueId: "venue-la", cityId: "city-la", date: daysFromNow(43), currency: "USD" },

  { id: "evt-chi-1", venueId: "venue-chi", cityId: "city-chi", date: daysFromNow(52), currency: "USD" },
  { id: "evt-chi-2", venueId: "venue-chi", cityId: "city-chi", date: daysFromNow(53), currency: "USD" },

  { id: "evt-tor-1", venueId: "venue-tor", cityId: "city-tor", date: daysFromNow(61), currency: "CAD" },
  { id: "evt-tor-2", venueId: "venue-tor", cityId: "city-tor", date: daysFromNow(62), currency: "CAD" },
];

export function seatZonesForVenue(venueId: string): SeatZone[] {
  return SEAT_ZONES.filter((z) => z.venueId === venueId);
}

export function eventsForCity(cityId: string): ConcertEvent[] {
  return CONCERT_EVENTS.filter((e) => e.cityId === cityId).sort((a, b) => a.date.localeCompare(b.date));
}
