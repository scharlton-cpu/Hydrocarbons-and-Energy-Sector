"use client";

import { useMemo, useState } from "react";
import { ListingTable } from "./ListingTable";
import { SeatZoneFilter } from "./SeatZoneFilter";
import { DateSelector } from "./DateSelector";
import { applyFilters, sortListingViews } from "@/lib/data-access/events";
import { cn } from "@/lib/cn";
import type { ListingSortKey, ListingView } from "@/lib/data-access/view-types";
import type { SeatZoneCategory } from "@/types/domain";

const QUICK_FILTERS: { key: "all" | "floor_only" | "price_drops" | "new_listings"; label: string }[] = [
  { key: "all", label: "Show All" },
  { key: "floor_only", label: "Floor Only" },
  { key: "price_drops", label: "Price Drops" },
  { key: "new_listings", label: "New Listings" },
];

export function CityListingExplorer({
  views,
  dates,
  availableZones,
  favoriteIds,
  onToggleFavorite,
}: {
  views: ListingView[];
  dates: { eventId: string; date: string }[];
  availableZones: SeatZoneCategory[];
  favoriteIds?: Set<string>;
  onToggleFavorite?: (listingId: string) => void;
}) {
  const [eventId, setEventId] = useState<string | null>(null);
  const [zones, setZones] = useState<SeatZoneCategory[]>([]);
  const [quickFilter, setQuickFilter] = useState<"all" | "floor_only" | "price_drops" | "new_listings">("all");
  const [sort, setSort] = useState<ListingSortKey>("lowest_price");

  const filtered = useMemo(() => {
    let scoped = eventId ? views.filter((v) => v.listing.concertEventId === eventId) : views;
    scoped = applyFilters(scoped, { seatZoneCategories: zones.length ? zones : undefined, quickFilter });
    return sortListingViews(scoped, sort);
  }, [views, eventId, zones, quickFilter, sort]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-1.5">
        {QUICK_FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setQuickFilter(f.key)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              quickFilter === f.key ? "bg-accent text-white" : "bg-surface-2 text-muted hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <DateSelector dates={dates} selected={eventId} onChange={setEventId} />
      <SeatZoneFilter available={availableZones} selected={zones} onChange={setZones} />

      <div className="text-xs text-muted">{filtered.length} listings match your filters.</div>

      <ListingTable views={filtered} sort={sort} onSortChange={setSort} favoriteIds={favoriteIds} onToggleFavorite={onToggleFavorite} />
    </div>
  );
}
