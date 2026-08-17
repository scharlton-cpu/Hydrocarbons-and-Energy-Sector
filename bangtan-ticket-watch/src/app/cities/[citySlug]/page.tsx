import { notFound } from "next/navigation";
import { getCityCatalog, getCitySummary, getCityListingViews } from "@/lib/data-access/cities";
import { getDateComparisonForCity, bestDateForFloor } from "@/lib/data-access/events";
import { getBuyOrWaitForCity } from "@/lib/data-access/decision";
import { getFavorites } from "@/lib/data-access/favorites";
import { PriceCard } from "@/components/dashboard/PriceCard";
import { EventCard } from "@/components/dashboard/EventCard";
import { StatusBadge } from "@/components/listings/StatusBadge";
import { PriceChangeBadge } from "@/components/listings/PriceChangeBadge";
import { CityListingExplorerWithFavorites } from "@/components/listings/CityListingExplorerWithFavorites";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney, formatPercent } from "@/lib/format";

export default async function CityDetailPage({ params }: PageProps<"/cities/[citySlug]">) {
  const { citySlug } = await params;

  const catalog = getCityCatalog(citySlug);
  const summary = getCitySummary(citySlug);
  if (!catalog || !summary) notFound();

  const dateComparison = getDateComparisonForCity(catalog.city.id);
  const bestDate = bestDateForFloor(dateComparison);
  const buyOrWait = getBuyOrWaitForCity(citySlug);
  const views = getCityListingViews(citySlug);
  const favoriteListingIds = getFavorites().map((f) => f.favorite.listingId);
  const availableZones = Array.from(new Set(catalog.seatZones.map((z) => z.category)));

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{summary.cityName}</h1>
          <StatusBadge status={summary.status} />
        </div>
        <p className="text-sm text-muted mt-1">
          {summary.venueName} · {summary.country} · {summary.dateCount} date{summary.dateCount === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <PriceCard label="Lowest Floor" value={summary.lowestFloor !== null ? formatMoney(summary.lowestFloor, summary.currency) : "—"} accent />
        <PriceCard label="Average Floor" value={summary.averageFloor !== null ? formatMoney(summary.averageFloor, summary.currency) : "—"} />
        <PriceCard label="Median Floor" value={summary.medianFloor !== null ? formatMoney(summary.medianFloor, summary.currency) : "—"} />
        <PriceCard
          label="24-Hour Change"
          value={formatPercent(summary.percentChange24h)}
          trailing={<PriceChangeBadge percentChange={summary.percentChange24h} />}
        />
      </div>

      {buyOrWait && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Buy or Wait?</h2>
            <Badge variant={buyOrWait.trend === "trending_down" ? "positive" : buyOrWait.trend === "trending_up" ? "negative" : "warning"}>
              {buyOrWait.headline}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 mb-3">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted-2">Current Floor Median</div>
              <div className="font-mono text-lg font-semibold">{formatMoney(buyOrWait.currentMedian, summary.currency)}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted-2">7-Day Median</div>
              <div className="font-mono text-lg font-semibold">{formatMoney(buyOrWait.sevenDayMedian, summary.currency)}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted-2">Change</div>
              <div className="font-mono text-lg font-semibold">{formatPercent(buyOrWait.percentChange7d)}</div>
            </div>
          </div>
          <p className="text-sm text-muted">{buyOrWait.explanation}</p>
        </Card>
      )}

      {dateComparison.length > 1 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Compare Dates</h2>
            {bestDate && (
              <span className="text-xs text-muted">
                Best {summary.cityName} date for floor tickets:{" "}
                <span className="text-accent-strong font-medium">
                  {new Date(bestDate.date + "T00:00:00Z").toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" })}
                </span>
              </span>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {dateComparison.map((d) => (
              <EventCard key={d.eventId} summary={d} currency={summary.currency} isBest={d.eventId === bestDate?.eventId} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">All Listings</h2>
        <CityListingExplorerWithFavorites
          views={views}
          dates={catalog.events.map((e) => ({ eventId: e.id, date: e.date }))}
          availableZones={availableZones}
          initialFavoriteListingIds={favoriteListingIds}
        />
      </div>
    </div>
  );
}
