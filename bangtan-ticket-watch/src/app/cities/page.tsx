import Link from "next/link";
import { getAllCitySummaries } from "@/lib/data-access/cities";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/listings/StatusBadge";
import { PriceChangeBadge } from "@/components/listings/PriceChangeBadge";
import { Card } from "@/components/ui/card";
import { formatMoney, formatDateShort } from "@/lib/format";
import { EmptyState } from "@/components/states/EmptyState";

export default function CitiesPage() {
  const summaries = getAllCitySummaries();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Cities</h1>
          <p className="text-sm text-muted mt-1">Every city currently on watch, and its floor-ticket pulse.</p>
        </div>
        <Link href="/cities/add">
          <Button variant="primary">+ Add City</Button>
        </Link>
      </div>

      {summaries.length === 0 ? (
        <EmptyState title="No cities yet" description="Add a city to begin monitoring." />
      ) : (
        <Card className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted-2">
                <th className="py-3 pl-5 pr-4 font-medium">City</th>
                <th className="py-3 pr-4 font-medium">Venue</th>
                <th className="py-3 pr-4 font-medium">Dates</th>
                <th className="py-3 pr-4 font-medium">Lowest Floor</th>
                <th className="py-3 pr-4 font-medium">24h Change</th>
                <th className="py-3 pr-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map((s) => (
                <tr key={s.citySlug} className="border-b border-border-soft last:border-b-0 hover:bg-surface-2/40">
                  <td className="py-3 pl-5 pr-4">
                    <Link href={`/cities/${s.citySlug}`} className="font-medium text-foreground hover:text-accent-strong">
                      {s.cityName}
                    </Link>
                    <div className="text-xs text-muted">{s.country}</div>
                  </td>
                  <td className="py-3 pr-4 text-sm text-muted">{s.venueName}</td>
                  <td className="py-3 pr-4 text-sm text-muted whitespace-nowrap">
                    {s.dates.length > 0 ? `${formatDateShort(s.dates[0])} – ${formatDateShort(s.dates[s.dates.length - 1])}` : "TBA"}
                  </td>
                  <td className="py-3 pr-4 font-mono text-sm text-foreground">
                    {s.lowestFloor !== null ? formatMoney(s.lowestFloor, s.currency) : "—"}
                  </td>
                  <td className="py-3 pr-4">
                    <PriceChangeBadge percentChange={s.percentChange24h} />
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={s.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
