import { getStore } from "@/lib/demo-data/store";
import { getAllCitySummaries } from "./cities";
import { getDateComparisonForCity, bestDateForFloor } from "./events";
import { getWatches } from "./watches";
import { formatDateShort, formatMoney } from "@/lib/format";

export interface Insight {
  id: string;
  icon: string;
  text: string;
}

/**
 * Every insight here is derived from actual stored data (city summaries,
 * per-date comparisons, watch matches) — never a fabricated or
 * model-generated prediction, per product rules.
 */
export function generateInsights(now: Date = new Date()): Insight[] {
  const insights: Insight[] = [];
  const summaries = getAllCitySummaries(now);

  for (const s of summaries) {
    if (s.percentChange24h !== null && s.percentChange24h <= -8) {
      insights.push({
        id: `price-${s.citySlug}`,
        icon: "🔥",
        text: `Floor prices in ${s.cityName} are down ${Math.abs(s.percentChange24h).toFixed(0)}% over the last 24 hours.`,
      });
    }
    if (s.newListings > 0 && s.inventoryCount > 0) {
      const pctNew = Math.round((s.newListings / s.inventoryCount) * 100);
      if (pctNew >= 15) {
        insights.push({
          id: `inventory-${s.citySlug}`,
          icon: "📈",
          text: `${s.cityName} inventory grew ${pctNew}% in the last 24 hours (${s.newListings} new listings).`,
        });
      }
    }
  }

  for (const s of summaries) {
    if (s.dateCount > 1) {
      const dateCmp = getDateComparisonForCity(getStore().cities.find((c) => c.slug === s.citySlug)!.id);
      const best = bestDateForFloor(dateCmp);
      if (best) {
        insights.push({
          id: `bestdate-${s.citySlug}`,
          icon: "💰",
          text: `${s.cityName} ${formatDateShort(best.date)} currently has the lowest floor price at ${formatMoney(best.lowestFloor!, s.currency)}.`,
        });
      }
    }
  }

  const watches = getWatches();
  if (watches.length > 0) {
    const store = getStore();
    let matchCount = 0;
    for (const watch of watches) {
      if (watch.status !== "active") continue;
      const cityEvents = store.events.filter((e) => e.cityId === watch.cityId);
      const eventIds = watch.concertEventIds === "all" ? cityEvents.map((e) => e.id) : watch.concertEventIds;
      const zones = store.seatZones.filter((z) => cityEvents.some((e) => e.venueId === z.venueId));
      const zoneIds = new Set(zones.filter((z) => watch.seatZoneCategories.includes(z.category)).map((z) => z.id));
      matchCount += store.listings.filter(
        (l) => eventIds.includes(l.concertEventId) && zoneIds.has(l.seatZoneId) && l.available && l.allInPrice <= watch.maxPrice
      ).length;
    }
    if (matchCount > 0) {
      insights.push({
        id: "watch-matches",
        icon: "🚨",
        text: `${matchCount} watched listing${matchCount === 1 ? "" : "s"} ${matchCount === 1 ? "is" : "are"} currently below your target price.`,
      });
    }
  }

  return insights;
}
