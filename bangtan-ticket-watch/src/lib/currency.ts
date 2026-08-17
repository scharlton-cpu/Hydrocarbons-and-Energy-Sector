import type { Currency } from "@/types/domain";
import { APP_CONFIG } from "@/config/app.config";

/**
 * Static approximate rates for display-only normalization (e.g. comparing
 * a CAD city against a USD city on the Compare page). Never used to alter
 * a stored price — every UI surface that shows a converted figure must
 * also show the original marketplace currency, per product rules.
 */
const APPROX_RATE_TO_USD: Record<Currency, number> = {
  USD: 1,
  CAD: 0.73,
  EUR: 1.08,
  GBP: 1.27,
};

export function toReferenceCurrencyApprox(amount: number, from: Currency): number {
  const rate = APPROX_RATE_TO_USD[from];
  const refRate = APPROX_RATE_TO_USD[APP_CONFIG.referenceCurrency];
  return Math.round((amount * rate) / refRate);
}
