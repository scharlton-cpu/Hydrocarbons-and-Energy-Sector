import { median } from "./price-change";
import type { InventorySummary } from "./inventory";

export type MarketTrend = "trending_down" | "trending_up" | "stable" | "high_volatility";

export interface BuyOrWaitAssessment {
  currentMedian: number;
  sevenDayMedian: number;
  percentChange7d: number;
  inventoryTrend: InventorySummary["trend"];
  trend: MarketTrend;
  headline: string;
  explanation: string;
}

/**
 * Objective, non-predictive "Buy or Wait?" summary. Deliberately avoids any
 * claim about future prices — only describes what has already happened in
 * the stored price/inventory data.
 */
export function assessBuyOrWait(
  currentPrices: number[],
  price7dAgoValues: number[],
  inventory: InventorySummary,
  scopeLabel: string
): BuyOrWaitAssessment | null {
  if (currentPrices.length === 0) return null;

  const currentMedian = median(currentPrices);
  const sevenDayMedian = median(price7dAgoValues.length > 0 ? price7dAgoValues : currentPrices);
  const percentChange7d = sevenDayMedian !== 0 ? Math.round(((currentMedian - sevenDayMedian) / sevenDayMedian) * 1000) / 10 : 0;

  const dispersion = stdDev(price7dAgoValues.length > 0 ? price7dAgoValues : currentPrices, sevenDayMedian);
  const dispersionPct = sevenDayMedian !== 0 ? dispersion / sevenDayMedian : 0;

  let trend: MarketTrend;
  let headline: string;
  if (percentChange7d <= -5) {
    trend = "trending_down";
    headline = "Trending Down";
  } else if (percentChange7d >= 5) {
    trend = "trending_up";
    headline = "Trending Up";
  } else if (dispersionPct > 0.22) {
    trend = "high_volatility";
    headline = "High Volatility";
  } else {
    trend = "stable";
    headline = "Stable";
  }

  const direction = percentChange7d < 0 ? "declined" : percentChange7d > 0 ? "risen" : "held steady";
  const inventoryPhrase =
    inventory.trend === "increasing"
      ? `while available inventory increased${inventory.percentChange24h !== null ? ` ${inventory.percentChange24h}%` : ""}`
      : inventory.trend === "decreasing"
        ? `while available inventory decreased${inventory.percentChange24h !== null ? ` ${Math.abs(inventory.percentChange24h)}%` : ""}`
        : "while available inventory has held roughly steady";

  const explanation = `${scopeLabel} prices have ${direction} ${Math.abs(percentChange7d)}% over seven days ${inventoryPhrase}. This reflects historical data only — it is not a guarantee prices will continue in this direction.`;

  return { currentMedian, sevenDayMedian, percentChange7d, inventoryTrend: inventory.trend, trend, headline, explanation };
}

function stdDev(values: number[], mean: number): number {
  if (values.length === 0) return 0;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}
