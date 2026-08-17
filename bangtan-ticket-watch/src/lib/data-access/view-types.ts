import type { Currency, Listing, ProviderId, SeatZoneCategory } from "@/types/domain";
import type { PriceChangeSummary } from "@/lib/analysis/price-change";
import type { DealScoreResult } from "@/lib/analysis/deal-score";
import type { PriceDropClassification } from "@/lib/analysis/price-drop";

export type CityStatus = "dropping" | "good_buying_zone" | "stable" | "rising" | "low_inventory";

export interface CityStatusInfo {
  status: CityStatus;
  label: string;
  icon: string;
}

export interface CitySummaryView {
  citySlug: string;
  cityName: string;
  country: string;
  currency: Currency;
  venueName: string;
  dateCount: number;
  dates: string[];
  lowestFloor: number | null;
  averageFloor: number | null;
  medianFloor: number | null;
  percentChange24h: number | null;
  percentChange7d: number | null;
  inventoryCount: number;
  newListings: number;
  listingsWithDrops: number;
  bestDeal: ListingView | null;
  status: CityStatusInfo;
}

export interface ListingView {
  listing: Listing;
  priceChange: PriceChangeSummary | null;
  dealScore: DealScoreResult;
  dropClassification: PriceDropClassification;
}

export interface EventDateSummaryView {
  eventId: string;
  date: string;
  lowestFloor: number | null;
  averageFloor: number | null;
  inventoryCount: number;
}

export type ListingSortKey =
  | "lowest_price"
  | "biggest_drop"
  | "section"
  | "marketplace"
  | "newest"
  | "recently_changed"
  | "best_deal";

export interface ListingFilters {
  seatZoneCategories?: SeatZoneCategory[];
  providers?: ProviderId[];
  section?: string;
  minPrice?: number;
  maxPrice?: number;
  minDropPercent?: number;
  dealRating?: DealScoreResult["rating"][];
  quickFilter?: "all" | "floor_only" | "under_target" | "price_drops" | "new_listings" | "favorites";
  targetPrice?: number;
}
