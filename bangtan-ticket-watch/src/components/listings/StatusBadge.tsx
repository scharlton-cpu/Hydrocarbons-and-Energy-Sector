import { Badge } from "@/components/ui/badge";
import type { CityStatusInfo } from "@/lib/data-access/view-types";

const VARIANT_BY_STATUS = {
  dropping: "positive",
  good_buying_zone: "positive",
  stable: "warning",
  rising: "negative",
  low_inventory: "warning",
} as const;

export function StatusBadge({ status }: { status: CityStatusInfo }) {
  return (
    <Badge variant={VARIANT_BY_STATUS[status.status]}>
      {status.icon} {status.label}
    </Badge>
  );
}
