/**
 * Configurable thresholds for price-drop detection and deal scoring.
 * Kept separate from business logic (src/lib/analysis) so the numbers can
 * be tuned — or eventually made per-user settings — without touching the
 * algorithms that consume them.
 */

export const PRICE_DROP_THRESHOLDS = {
  minor: 0.05,
  notable: 0.1,
  major: 0.15,
  exceptional: 0.2,
} as const;

export type PriceDropLevel = "none" | "minor" | "notable" | "major" | "exceptional";

export const DEAL_SCORE_THRESHOLDS = {
  /** % below median to be a "Great Deal" */
  greatDeal: 0.15,
  /** % below median to be a "Good Deal" */
  goodDeal: 0.05,
  /** % above median before it's flagged "Above Market" */
  aboveMarket: 0.05,
} as const;

export const INVENTORY_INSIGHT_THRESHOLDS = {
  significantIncreasePct: 0.2,
  significantDecreasePct: 0.2,
  lowInventoryCount: 5,
} as const;
