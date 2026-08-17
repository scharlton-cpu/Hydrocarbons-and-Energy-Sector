import { Badge } from "@/components/ui/badge";
import { formatPercent } from "@/lib/format";

export function PriceChangeBadge({ percentChange }: { percentChange: number | null }) {
  if (percentChange === null) return <Badge variant="neutral">—</Badge>;
  if (percentChange < -0.5) {
    return (
      <Badge variant="positive">
        <span aria-hidden>↓</span> {formatPercent(percentChange, { withSign: false }).replace("-", "")}
      </Badge>
    );
  }
  if (percentChange > 0.5) {
    return (
      <Badge variant="negative">
        <span aria-hidden>↑</span> {formatPercent(percentChange, { withSign: false })}
      </Badge>
    );
  }
  return <Badge variant="neutral">Flat</Badge>;
}
