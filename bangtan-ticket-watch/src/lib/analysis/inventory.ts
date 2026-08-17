import type { Listing } from "@/types/domain";
import { INVENTORY_INSIGHT_THRESHOLDS } from "@/config/thresholds.config";

export interface InventorySummary {
  total: number;
  newLast24h: number;
  percentChange24h: number | null;
  trend: "increasing" | "decreasing" | "stable";
  isLow: boolean;
}

export function summarizeInventory(listings: Listing[], now: Date = new Date()): InventorySummary {
  const dayAgoMs = now.getTime() - 24 * 60 * 60 * 1000;
  const available = listings.filter((l) => l.available);
  const total = available.length;
  const newLast24h = available.filter((l) => new Date(l.firstSeenAt).getTime() >= dayAgoMs).length;
  const existedYesterday = total - newLast24h;

  const percentChange24h = existedYesterday > 0 ? Math.round(((total - existedYesterday) / existedYesterday) * 1000) / 10 : null;

  let trend: InventorySummary["trend"] = "stable";
  if (percentChange24h !== null) {
    if (percentChange24h / 100 >= INVENTORY_INSIGHT_THRESHOLDS.significantIncreasePct) trend = "increasing";
    else if (percentChange24h / 100 <= -INVENTORY_INSIGHT_THRESHOLDS.significantDecreasePct) trend = "decreasing";
  }

  return {
    total,
    newLast24h,
    percentChange24h,
    trend,
    isLow: total > 0 && total <= INVENTORY_INSIGHT_THRESHOLDS.lowInventoryCount,
  };
}

export function inventoryInsightText(cityName: string, summary: InventorySummary): string | null {
  if (summary.trend === "increasing") {
    return `⚠️ ${cityName} floor inventory is up ${summary.percentChange24h}% today. This is an observation, not a guaranteed prediction — but rising supply has historically coincided with more competitive pricing.`;
  }
  if (summary.trend === "decreasing") {
    return `⚠️ ${cityName} inventory dropped ${Math.abs(summary.percentChange24h ?? 0)}% today. Fewer listings can mean tighter pricing ahead.`;
  }
  if (summary.isLow) {
    return `⚠️ ${cityName} has low inventory (${summary.total} listings). Availability may be limited.`;
  }
  return null;
}
