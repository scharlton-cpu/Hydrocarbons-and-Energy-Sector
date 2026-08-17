/**
 * Domain model. Mirrors prisma/schema.prisma one-for-one so the in-memory
 * demo data layer (src/lib/demo-data) and a future Prisma-backed data layer
 * can implement the exact same shape — see src/lib/data-access/README.md.
 *
 * Hierarchy: Artist -> Tour -> City -> Venue -> ConcertEvent -> SeatZone
 *            Provider -> ProviderEvent -> Listing -> PriceSnapshot
 */

export type Currency = "USD" | "CAD" | "EUR" | "GBP";

export interface Artist {
  id: string;
  slug: string;
  name: string;
}

export interface Tour {
  id: string;
  artistId: string;
  slug: string;
  name: string;
}

export interface City {
  id: string;
  tourId: string;
  slug: string;
  name: string;
  country: string;
  timezone: string;
}

export interface Venue {
  id: string;
  cityId: string;
  name: string;
  address?: string;
}

export interface ConcertEvent {
  id: string;
  venueId: string;
  cityId: string;
  date: string; // ISO date, e.g. "2026-08-08"
  doorsTime?: string;
  currency: Currency;
}

/** Venue-specific seating zone. Every venue defines its own set. */
export interface SeatZone {
  id: string;
  venueId: string;
  name: string; // e.g. "Floor A", "Section 101"
  category: SeatZoneCategory;
}

export type SeatZoneCategory = "floor" | "lower_bowl" | "club" | "upper_level" | "other";

export type ProviderId = "tickpick" | "stubhub" | "seatgeek";

export interface Provider {
  id: ProviderId;
  name: string;
  enabled: boolean;
  /** true when live credentials are configured; false means mock/demo mode. */
  isLive: boolean;
  baseListingUrl: string;
}

/** A marketplace's own record of an event, before listings are normalized. */
export interface ProviderEvent {
  id: string;
  providerId: ProviderId;
  concertEventId: string;
  providerEventId: string; // the marketplace's own event identifier
  lastSyncedAt: string;
  lastSyncStatus: "ok" | "error" | "unavailable";
  lastSyncError?: string;
}

/**
 * Normalized ticket listing. Every provider adapter must map its raw
 * response onto this exact shape — see src/lib/providers/types.ts.
 */
export interface Listing {
  listingId: string;
  provider: ProviderId;
  providerEventId: string;
  concertEventId: string;
  seatZoneId: string;
  artist: string;
  tour: string;
  city: string;
  venue: string;
  concertDate: string;
  section: string;
  row?: string;
  seatNumbers?: string;
  seatType: "floor" | "lower_bowl" | "club" | "upper_level" | "other";
  quantity: number;
  basePrice: number;
  fees: number;
  allInPrice: number;
  currency: Currency;
  listingUrl: string;
  available: boolean;
  firstSeenAt: string;
  lastSeenAt: string;
  lastPriceChangeAt: string;
}

export interface PriceSnapshot {
  id: string;
  listingId: string;
  price: number;
  allInPrice: number;
  available: boolean;
  capturedAt: string;
}

export type WatchStatus = "active" | "paused" | "deleted";

export interface Watch {
  id: string;
  userId: string;
  name: string;
  cityId: string;
  concertEventIds: string[] | "all";
  seatZoneCategories: SeatZoneCategory[];
  quantity: number;
  maxPrice: number;
  currency: Currency;
  status: WatchStatus;
  createdAt: string;
}

export type AlertRuleType =
  | "price_below"
  | "zone_price_below"
  | "percent_drop"
  | "new_listing_below"
  | "inventory_spike"
  | "below_comparable_pct";

export interface AlertRule {
  id: string;
  userId: string;
  watchId?: string;
  cityId?: string;
  concertEventId?: string;
  seatZoneCategory?: SeatZoneCategory;
  type: AlertRuleType;
  thresholdPrice?: number;
  thresholdPercent?: number;
  active: boolean;
  createdAt: string;
}

export interface AlertEvent {
  id: string;
  ruleId: string;
  listingId?: string;
  message: string;
  triggeredAt: string;
  read: boolean;
}

export interface Favorite {
  id: string;
  userId: string;
  listingId: string;
  priceWhenSaved: number;
  currency: Currency;
  savedAt: string;
  stillAvailable: boolean;
}

export type NotificationChannel = "in_app" | "email" | "sms" | "push" | "whatsapp" | "telegram";

export interface NotificationLog {
  id: string;
  alertEventId: string;
  channel: NotificationChannel;
  sentAt: string;
  status: "sent" | "failed" | "skipped_not_configured";
}
