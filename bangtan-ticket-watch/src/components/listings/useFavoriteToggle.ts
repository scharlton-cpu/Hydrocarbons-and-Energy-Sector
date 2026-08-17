"use client";

import { useCallback, useState } from "react";

export function useFavoriteToggle(initialFavoriteListingIds: string[]) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set(initialFavoriteListingIds));

  const toggle = useCallback((listingId: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      const wasFavorite = next.has(listingId);
      if (wasFavorite) next.delete(listingId);
      else next.add(listingId);

      fetch("/api/favorites", {
        method: wasFavorite ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      }).catch(() => {
        // Best-effort; a failed request just means the star reverts on next full reload.
      });

      return next;
    });
  }, []);

  return { favoriteIds, toggle };
}
