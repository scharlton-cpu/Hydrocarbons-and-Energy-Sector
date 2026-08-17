import { getAllCitySummaries } from "@/lib/data-access/cities";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PriceChangeBadge } from "@/components/listings/PriceChangeBadge";
import { formatMoney } from "@/lib/format";
import { toReferenceCurrencyApprox } from "@/lib/currency";
import { APP_CONFIG } from "@/config/app.config";
import { EmptyState } from "@/components/states/EmptyState";

export default function ComparePage() {
  const summaries = getAllCitySummaries().filter((s) => s.lowestFloor !== null);
  const sorted = [...summaries].sort((a, b) => (a.lowestFloor ?? Infinity) - (b.lowestFloor ?? Infinity));
  const cheapest = sorted[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Compare Cities</h1>
        <p className="text-sm text-muted mt-1">
          Floor prices side by side. Figures are shown in each marketplace&apos;s own currency, with an approximate {APP_CONFIG.referenceCurrency}{" "}
          equivalent for quick comparison.
        </p>
      </div>

      {sorted.length === 0 ? (
        <EmptyState title="Nothing to compare yet" description="Add at least one city with floor listings." />
      ) : (
        <div className="space-y-3">
          {sorted.map((s) => {
            const isCheapest = s.citySlug === cheapest?.citySlug;
            const converted = s.currency !== APP_CONFIG.referenceCurrency && s.lowestFloor !== null ? toReferenceCurrencyApprox(s.lowestFloor, s.currency) : null;
            return (
              <Card key={s.citySlug} className={`p-5 ${isCheapest ? "border-accent/60 bg-accent-soft/30" : ""}`}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{s.cityName}</h3>
                      {isCheapest && <Badge variant="accent">Cheapest Floor</Badge>}
                    </div>
                    <p className="text-xs text-muted mt-0.5">{s.venueName}</p>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <div className="text-[11px] uppercase tracking-wide text-muted-2">Floor From</div>
                      <div className="font-mono text-xl font-semibold text-foreground">
                        {s.lowestFloor !== null ? formatMoney(s.lowestFloor, s.currency) : "—"}
                      </div>
                      {converted !== null && (
                        <div className="text-[11px] text-muted-2">≈ {formatMoney(converted, APP_CONFIG.referenceCurrency)}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] uppercase tracking-wide text-muted-2">7-Day Change</div>
                      <PriceChangeBadge percentChange={s.percentChange7d} />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
