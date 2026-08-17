import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/listings/StatusBadge";
import { PriceChangeBadge } from "@/components/listings/PriceChangeBadge";
import { formatMoney, formatDateShort } from "@/lib/format";
import type { CitySummaryView } from "@/lib/data-access/view-types";

export function CityCard({ summary }: { summary: CitySummaryView }) {
  return (
    <Link href={`/cities/${summary.citySlug}`} className="group block">
      <Card className="h-full transition-colors group-hover:border-accent/50">
        <div className="p-5 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold tracking-tight">{summary.cityName}</h3>
              <p className="text-xs text-muted mt-0.5">
                {summary.venueName} · {summary.dateCount} date{summary.dateCount === 1 ? "" : "s"}
              </p>
            </div>
            <StatusBadge status={summary.status} />
          </div>
        </div>

        <div className="px-5 pb-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted-2">Lowest Floor</div>
              <div className="font-mono text-xl font-semibold text-foreground mt-0.5">
                {summary.lowestFloor !== null ? formatMoney(summary.lowestFloor, summary.currency) : "—"}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted-2">Average Floor</div>
              <div className="font-mono text-xl font-semibold text-foreground/80 mt-0.5">
                {summary.averageFloor !== null ? formatMoney(summary.averageFloor, summary.currency) : "—"}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border-soft pt-3">
            <div className="text-xs text-muted">24-Hour Change</div>
            <PriceChangeBadge percentChange={summary.percentChange24h} />
          </div>

          <div className="flex items-center justify-between text-xs text-muted">
            <span>{summary.inventoryCount} floor listings</span>
            {summary.dates.length > 0 && <span>Next: {formatDateShort(summary.dates[0])}</span>}
          </div>
        </div>
      </Card>
    </Link>
  );
}
