import type { Currency, Listing, ProviderId } from "@/types/domain";

/**
 * Every marketplace connector implements this exact interface. The rest of
 * the app only ever talks to `TicketProvider`, never to a specific
 * marketplace's SDK/response shape — that isolation is what lets a new
 * marketplace be added without touching application code (see
 * src/lib/providers/registry.ts).
 */
export interface TicketProviderEventQuery {
  artist: string;
  city: string;
  venue: string;
  concertDate: string; // ISO date
}

export interface RawProviderEvent {
  providerEventId: string;
  name: string;
  url: string;
}

/** Raw, provider-shaped listing before normalization. Shape varies per provider. */
export type RawListing = Record<string, unknown>;

export interface TicketProvider {
  id: ProviderId;
  displayName: string;

  /** True when real credentials are present in env; false runs in mock/demo mode. */
  isLive(): boolean;

  /** Find the provider's own event record matching a concert. */
  searchEvents(query: TicketProviderEventQuery): Promise<RawProviderEvent[]>;

  /** Fetch a single event by the provider's own event id. */
  getEvent(providerEventId: string): Promise<RawProviderEvent | null>;

  /** Fetch raw listings for a provider event. */
  getListings(providerEventId: string): Promise<RawListing[]>;

  /** Map one raw listing into the app's normalized Listing shape. */
  normalizeListing(raw: RawListing, context: NormalizeContext): Listing;
}

export interface NormalizeContext {
  concertEventId: string;
  seatZoneId: string;
  artist: string;
  tour: string;
  city: string;
  venue: string;
  concertDate: string;
  currency: Currency;
}

export interface ProviderSyncResult {
  providerId: ProviderId;
  status: "ok" | "error" | "unavailable";
  listingCount: number;
  error?: string;
  syncedAt: string;
}
