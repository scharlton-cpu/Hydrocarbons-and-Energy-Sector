import { PRICE_DROP_THRESHOLDS, type PriceDropLevel } from "@/config/thresholds.config";

export interface PriceDropClassification {
  level: PriceDropLevel;
  label: string;
  icon: string;
}

/** `percentChange` is negative for a drop (e.g. -18.2 for an 18.2% drop). */
export function classifyPriceDrop(percentChange: number | null): PriceDropClassification {
  if (percentChange === null || percentChange >= -PRICE_DROP_THRESHOLDS.minor * 100) {
    return { level: "none", label: "No significant change", icon: "" };
  }
  const dropPct = -percentChange / 100;

  if (dropPct >= PRICE_DROP_THRESHOLDS.exceptional) {
    return { level: "exceptional", label: "Exceptional Drop", icon: "🚨" };
  }
  if (dropPct >= PRICE_DROP_THRESHOLDS.major) {
    return { level: "major", label: "Major Drop", icon: "🔥" };
  }
  if (dropPct >= PRICE_DROP_THRESHOLDS.notable) {
    return { level: "notable", label: "Notable Drop", icon: "" };
  }
  return { level: "minor", label: "Minor Drop", icon: "" };
}
