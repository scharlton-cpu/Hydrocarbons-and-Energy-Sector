"use client";

import { CityListingExplorer } from "./CityListingExplorer";
import { useFavoriteToggle } from "./useFavoriteToggle";
import type { ListingView } from "@/lib/data-access/view-types";
import type { SeatZoneCategory } from "@/types/domain";

export function CityListingExplorerWithFavorites({
  views,
  dates,
  availableZones,
  initialFavoriteListingIds,
}: {
  views: ListingView[];
  dates: { eventId: string; date: string }[];
  availableZones: SeatZoneCategory[];
  initialFavoriteListingIds: string[];
}) {
  const { favoriteIds, toggle } = useFavoriteToggle(initialFavoriteListingIds);
  return (
    <CityListingExplorer views={views} dates={dates} availableZones={availableZones} favoriteIds={favoriteIds} onToggleFavorite={toggle} />
  );
}
