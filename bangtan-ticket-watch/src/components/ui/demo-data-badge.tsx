import { Badge } from "@/components/ui/badge";

/**
 * Surfaced anywhere listing data is shown, per product rule: never let
 * generated/mock data be mistaken for a live marketplace feed.
 */
export function DemoDataBadge() {
  return (
    <Badge variant="accent" title="This environment has no live marketplace credentials configured — all listings are generated demo data.">
      ● Demo data
    </Badge>
  );
}
