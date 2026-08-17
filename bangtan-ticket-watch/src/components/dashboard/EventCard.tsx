import Link from "next/link";
import { Card } from "@/components/ui/card";
import { formatMoney, formatDate } from "@/lib/format";
import type { Currency } from "@/types/domain";
import type { EventDateSummaryView } from "@/lib/data-access/view-types";
import { cn } from "@/lib/cn";

export function EventCard({
  summary,
  currency,
  isBest,
}: {
  summary: EventDateSummaryView;
  currency: Currency;
  isBest?: boolean;
}) {
  return (
    <Link href={`/events/${summary.eventId}`}>
      <Card className={cn("p-4 h-full transition-colors hover:border-accent/50", isBest && "border-accent/60 bg-accent-soft/40")}>
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-foreground">{formatDate(summary.date)}</div>
          {isBest && <span className="text-[10px] font-semibold uppercase tracking-wide text-accent-strong">Best Floor Deal</span>}
        </div>
        <div className="font-mono text-xl font-semibold mt-2">
          {summary.lowestFloor !== null ? formatMoney(summary.lowestFloor, currency) : "No floor listings"}
        </div>
        <div className="text-xs text-muted mt-1">
          {summary.inventoryCount} floor listing{summary.inventoryCount === 1 ? "" : "s"}
        </div>
      </Card>
    </Link>
  );
}
