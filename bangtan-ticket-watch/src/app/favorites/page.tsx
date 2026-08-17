import { getFavorites } from "@/lib/data-access/favorites";
import { FavoritesClient } from "./FavoritesClient";

export default function FavoritesPage() {
  const favorites = getFavorites();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Favorites</h1>
        <p className="text-sm text-muted mt-1">Listings you&apos;ve starred, with price movement tracked since you saved them.</p>
      </div>
      <FavoritesClient favorites={favorites} />
    </div>
  );
}
