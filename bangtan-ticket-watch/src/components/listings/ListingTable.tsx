"use client";

import { ListingRow } from "./ListingRow";
import { EmptyState } from "@/components/states/EmptyState";
import { cn } from "@/lib/cn";
import type { ListingSortKey } from "@/lib/data-access/view-types";
import type { ListingView } from "@/lib/data-access/view-types";

const SORT_OPTIONS: { key: ListingSortKey; label: string }[] = [
  { key: "lowest_price", label: "Lowest Price" },
  { key: "biggest_drop", label: "Biggest Drop" },
  { key: "best_deal", label: "Best Deal" },
  { key: "section", label: "Section" },
  { key: "marketplace", label: "Marketplace" },
  { key: "newest", label: "Newest" },
  { key: "recently_changed", label: "Recently Changed" },
];

export function ListingTable({
  views,
  sort,
  onSortChange,
  favoriteIds,
  onToggleFavorite,
}: {
  views: ListingView[];
  sort: ListingSortKey;
  onSortChange: (sort: ListingSortKey) => void;
  favoriteIds?: Set<string>;
  onToggleFavorite?: (listingId: string) => void;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <span className="text-xs text-muted mr-1">Sort:</span>
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => onSortChange(opt.key)}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
              sort === opt.key ? "bg-accent-soft text-accent-strong" : "text-muted hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {views.length === 0 ? (
        <EmptyState title="No tickets found" description="Try widening your filters or checking back after the next refresh." />
      ) : (
        <div className="overflow-x-auto scrollbar-thin rounded-2xl border border-border">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted-2">
                <th className="py-3 pr-4 pl-4 font-medium">Marketplace</th>
                <th className="py-3 pr-4 font-medium">Section</th>
                <th className="py-3 pr-4 font-medium">Row</th>
                <th className="py-3 pr-4 font-medium text-center">Qty</th>
                <th className="py-3 pr-4 font-medium">All-In Price</th>
                <th className="py-3 pr-4 font-medium">Previous</th>
                <th className="py-3 pr-4 font-medium">Change</th>
                <th className="py-3 pr-4 font-medium">% Change</th>
                <th className="py-3 pr-4 font-medium">Deal</th>
                <th className="py-3 pr-4 font-medium">Updated</th>
                <th className="py-3 pr-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="px-4">
              {views.map((v) => (
                <ListingRow
                  key={v.listing.listingId}
                  view={v}
                  isFavorite={favoriteIds?.has(v.listing.listingId)}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
