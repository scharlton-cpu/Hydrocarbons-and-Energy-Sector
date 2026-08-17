import { Badge } from "@/components/ui/badge";
import type { DealScoreResult } from "@/lib/analysis/deal-score";

const VARIANT_BY_RATING = {
  great: "positive",
  good: "positive",
  fair: "warning",
  above_market: "negative",
} as const;

export function DealBadge({ deal }: { deal: DealScoreResult }) {
  return (
    <Badge variant={VARIANT_BY_RATING[deal.rating]}>
      {deal.icon} {deal.label}
    </Badge>
  );
}
