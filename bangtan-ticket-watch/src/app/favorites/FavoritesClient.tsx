"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MarketplaceBadge } from "@/components/listings/MarketplaceBadge";
import { EmptyState } from "@/components/states/EmptyState";
import { formatMoney, formatRelativeTime } from "@/lib/format";
import type { FavoriteView } from "@/lib/data-access/favorites";

export function FavoritesClient({ favorites }: { favorites: FavoriteView[] }) {
  const router = useRouter();

  async function remove(listingId: string) {
    await fetch("/api/favorites", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ listingId }) });
    router.refresh();
  }

  if (favorites.length === 0) {
    return <EmptyState icon="★" title="No favorites yet" description="Star a listing from any listing table to save it here." />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {favorites.map((f) => {
        const changeColor = f.changeSinceSaved === null ? "text-muted" : f.changeSinceSaved < 0 ? "text-positive" : f.changeSinceSaved > 0 ? "text-negative" : "text-muted";
        return (
          <Card key={f.favorite.id} className="p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                {f.listing ? <MarketplaceBadge provider={f.listing.provider} /> : <span className="text-xs text-muted">Marketplace unknown</span>}
                <div className="text-sm font-medium text-foreground mt-1">{f.listing?.section ?? "Listing removed"}</div>
              </div>
              {!f.stillAvailable && <Badge variant="warning">No Longer Available</Badge>}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-muted-2">Saved At</div>
                <div className="font-mono text-sm">{formatMoney(f.favorite.priceWhenSaved, f.favorite.currency)}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-muted-2">Current</div>
                <div className="font-mono text-sm">{f.currentPrice !== null ? formatMoney(f.currentPrice, f.favorite.currency) : "—"}</div>
              </div>
            </div>

            {f.changeSinceSaved !== null && (
              <div className={`text-xs mt-2 font-mono ${changeColor}`}>
                {f.changeSinceSaved > 0 ? "+" : ""}
                {formatMoney(f.changeSinceSaved, f.favorite.currency)} since saved
              </div>
            )}

            <div className="text-xs text-muted mt-1">Saved {formatRelativeTime(f.favorite.savedAt)}</div>

            <div className="flex items-center gap-2 mt-4">
              {f.listing && (
                <a href={f.listing.listingUrl} target="_blank" rel="noopener noreferrer nofollow">
                  <Button variant="primary" size="sm">
                    View Ticket
                  </Button>
                </a>
              )}
              <Button variant="ghost" size="sm" onClick={() => remove(f.favorite.listingId)}>
                Remove
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
