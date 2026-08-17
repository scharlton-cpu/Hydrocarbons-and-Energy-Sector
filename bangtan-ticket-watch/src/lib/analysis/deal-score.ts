import { DEAL_SCORE_THRESHOLDS } from "@/config/thresholds.config";
import { median } from "./price-change";

export type DealRating = "great" | "good" | "fair" | "above_market";

export interface DealScoreResult {
  rating: DealRating;
  label: string;
  icon: string;
  comparableMedian: number;
  percentBelowMedian: number; // positive = below median (cheaper), negative = above
}

/**
 * Modular, intentionally simple v1: compares a listing's all-in price
 * against the median all-in price of "comparable" listings — same concert
 * event + same seat zone by default. Swap in a more sophisticated model
 * later (row-aware, quantity-aware, cross-provider-weighted, etc.) without
 * changing callers — they only depend on this function's signature.
 */
export function scoreDeal(price: number, comparablePrices: number[]): DealScoreResult {
  const comparableMedian = median(comparablePrices.length > 0 ? comparablePrices : [price]);
  const percentBelowMedian = comparableMedian !== 0 ? Math.round(((comparableMedian - price) / comparableMedian) * 1000) / 10 : 0;

  if (percentBelowMedian / 100 >= DEAL_SCORE_THRESHOLDS.greatDeal) {
    return { rating: "great", label: "Great Deal", icon: "🔥", comparableMedian, percentBelowMedian };
  }
  if (percentBelowMedian / 100 >= DEAL_SCORE_THRESHOLDS.goodDeal) {
    return { rating: "good", label: "Good Deal", icon: "🟢", comparableMedian, percentBelowMedian };
  }
  if (percentBelowMedian / 100 <= -DEAL_SCORE_THRESHOLDS.aboveMarket) {
    return { rating: "above_market", label: "Above Market", icon: "🔴", comparableMedian, percentBelowMedian };
  }
  return { rating: "fair", label: "Fair Price", icon: "🟡", comparableMedian, percentBelowMedian };
}
