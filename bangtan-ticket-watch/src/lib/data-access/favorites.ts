import { getStore } from "@/lib/demo-data/store";
import type { Favorite, Listing } from "@/types/domain";

const DEMO_USER_ID = "demo-user";

export interface FavoriteView {
  favorite: Favorite;
  listing: Listing | null; // null when the listing has since disappeared
  currentPrice: number | null;
  changeSinceSaved: number | null; // dollars, negative = price dropped since saving
  stillAvailable: boolean;
}

export function getFavorites(): FavoriteView[] {
  const store = getStore();
  return store.favorites.map((favorite) => {
    const listing = store.listings.find((l) => l.listingId === favorite.listingId) ?? null;
    const stillAvailable = Boolean(listing?.available);
    if (favorite.stillAvailable !== stillAvailable) favorite.stillAvailable = stillAvailable;

    return {
      favorite,
      listing,
      currentPrice: listing ? listing.allInPrice : null,
      changeSinceSaved: listing ? Math.round((listing.allInPrice - favorite.priceWhenSaved) * 100) / 100 : null,
      stillAvailable,
    };
  });
}

export function addFavorite(listingId: string): Favorite | null {
  const store = getStore();
  const listing = store.listings.find((l) => l.listingId === listingId);
  if (!listing) return null;
  const existing = store.favorites.find((f) => f.listingId === listingId);
  if (existing) return existing;

  const favorite: Favorite = {
    id: `fav-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    userId: DEMO_USER_ID,
    listingId,
    priceWhenSaved: listing.allInPrice,
    currency: listing.currency,
    savedAt: new Date().toISOString(),
    stillAvailable: true,
  };
  store.favorites.push(favorite);
  return favorite;
}

export function removeFavorite(favoriteId: string): void {
  const store = getStore();
  store.favorites = store.favorites.filter((f) => f.id !== favoriteId);
}

export function isFavorited(listingId: string): boolean {
  return getStore().favorites.some((f) => f.listingId === listingId);
}
