"use client";

import { MarketplaceBadge } from "./MarketplaceBadge";
import { PriceChangeBadge } from "./PriceChangeBadge";
import { DealBadge } from "./DealBadge";
import { formatMoney, formatRelativeTime } from "@/lib/format";
import type { ListingView } from "@/lib/data-access/view-types";

export function ListingRow({
  view,
  isFavorite,
  onToggleFavorite,
}: {
  view: ListingView;
  isFavorite?: boolean;
  onToggleFavorite?: (listingId: string) => void;
}) {
  const { listing, priceChange, dealScore } = view;
  const pct = priceChange?.percentChange7d ?? priceChange?.percentChange ?? null;

  return (
    <tr className="border-b border-border-soft last:border-b-0 hover:bg-surface-2/40">
      <td className="py-3 pr-4 pl-4">
        <MarketplaceBadge provider={listing.provider} />
      </td>
      <td className="py-3 pr-4 text-sm text-foreground whitespace-nowrap">{listing.section}</td>
      <td className="py-3 pr-4 text-sm text-muted whitespace-nowrap">{listing.row ?? "—"}</td>
      <td className="py-3 pr-4 text-sm text-muted text-center">{listing.quantity}</td>
      <td className="py-3 pr-4 font-mono text-sm text-foreground whitespace-nowrap">
        {formatMoney(listing.allInPrice, listing.currency)}
      </td>
      <td className="py-3 pr-4 font-mono text-sm text-muted whitespace-nowrap">
        {priceChange ? formatMoney(priceChange.previous, listing.currency) : "—"}
      </td>
      <td className="py-3 pr-4 font-mono text-sm whitespace-nowrap">
        {priceChange ? (
          <span className={priceChange.dollarChange < 0 ? "text-positive" : priceChange.dollarChange > 0 ? "text-negative" : "text-muted"}>
            {priceChange.dollarChange > 0 ? "+" : ""}
            {formatMoney(priceChange.dollarChange, listing.currency)}
          </span>
        ) : (
          "—"
        )}
      </td>
      <td className="py-3 pr-4 whitespace-nowrap">
        <PriceChangeBadge percentChange={pct} />
      </td>
      <td className="py-3 pr-4 whitespace-nowrap">
        <DealBadge deal={dealScore} />
      </td>
      <td className="py-3 pr-4 text-xs text-muted whitespace-nowrap">{formatRelativeTime(listing.lastSeenAt)}</td>
      <td className="py-3 pr-4">
        <div className="flex items-center gap-2 justify-end">
          {onToggleFavorite && (
            <button
              type="button"
              onClick={() => onToggleFavorite(listing.listingId)}
              className="text-lg leading-none"
              aria-label={isFavorite ? "Remove favorite" : "Add favorite"}
              title={isFavorite ? "Remove favorite" : "Add favorite"}
            >
              {isFavorite ? "★" : "☆"}
            </button>
          )}
          <a
            href={listing.listingUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-strong whitespace-nowrap"
          >
            View Ticket
          </a>
        </div>
      </td>
    </tr>
  );
}
