import { notFound } from "next/navigation";
import Link from "next/link";
import { getEventDetail, getEventListingViews } from "@/lib/data-access/events";
import { getPriceSeriesForEvent } from "@/lib/data-access/price-series";
import { getFavorites } from "@/lib/data-access/favorites";
import { getStore } from "@/lib/demo-data/store";
import { PriceCard } from "@/components/dashboard/PriceCard";
import { EventListingExplorer } from "@/components/listings/EventListingExplorer";
import { EventPriceChartClient } from "@/components/charts/EventPriceChartClient";
import { Card } from "@/components/ui/card";
import { formatDate, formatMoney } from "@/lib/format";
import { average, median } from "@/lib/analysis/price-change";

export default async function EventDetailPage({ params }: PageProps<"/events/[eventId]">) {
  const { eventId } = await params;

  const detail = getEventDetail(eventId);
  if (!detail) notFound();

  const views = getEventListingViews(eventId);
  const floorViews = views.filter((v) => v.listing.seatType === "floor");
  const series = getPriceSeriesForEvent(eventId, { filter: "all" });
  const favoriteListingIds = getFavorites().map((f) => f.favorite.listingId);
  const store = getStore();
  const availableZones = Array.from(
    new Set(store.seatZones.filter((z) => z.venueId === detail.venue.id).map((z) => z.category))
  );

  const floorPrices = floorViews.map((v) => v.listing.allInPrice);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <Link href={`/cities/${detail.citySlug}`} className="text-xs text-muted hover:text-foreground">
          ← {detail.cityName}
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground mt-1">{formatDate(detail.event.date)}</h1>
        <p className="text-sm text-muted mt-1">{detail.venue.name}</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <PriceCard
          label="Lowest Floor"
          value={floorPrices.length ? formatMoney(Math.min(...floorPrices), detail.event.currency) : "—"}
          accent
        />
        <PriceCard label="Average Floor" value={floorPrices.length ? formatMoney(average(floorPrices), detail.event.currency) : "—"} />
        <PriceCard label="Median Floor" value={floorPrices.length ? formatMoney(median(floorPrices), detail.event.currency) : "—"} />
        <PriceCard label="Total Listings" value={String(views.length)} sublabel={`${floorViews.length} floor`} />
      </div>

      <Card className="p-5">
        <EventPriceChartClient fullSeries={series} currency={detail.event.currency} />
      </Card>

      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Listings</h2>
        <EventListingExplorer views={views} availableZones={availableZones} initialFavoriteListingIds={favoriteListingIds} />
      </div>
    </div>
  );
}
