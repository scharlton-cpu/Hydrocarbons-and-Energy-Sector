import Link from "next/link";
import { getAllCitySummaries } from "@/lib/data-access/cities";
import { generateInsights } from "@/lib/data-access/insights";
import { CityCard } from "@/components/dashboard/CityCard";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/states/EmptyState";
import { Card } from "@/components/ui/card";
import { APP_CONFIG } from "@/config/app.config";

export default function DashboardPage() {
  const summaries = getAllCitySummaries();
  const insights = generateInsights();
  const cheapestFloor = summaries
    .filter((s) => s.lowestFloor !== null)
    .sort((a, b) => (a.lowestFloor ?? Infinity) - (b.lowestFloor ?? Infinity))[0];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{APP_CONFIG.productName}</h1>
          <p className="text-sm text-muted mt-1">
            Tracking {APP_CONFIG.defaultArtistSlug.toUpperCase()} resale tickets across {summaries.length} cit{summaries.length === 1 ? "y" : "ies"}.
            {cheapestFloor && (
              <>
                {" "}
                Cheapest floor right now: <span className="text-foreground font-medium">{cheapestFloor.cityName}</span>.
              </>
            )}
          </p>
        </div>
        <Link href="/cities/add">
          <Button variant="primary" size="md">
            + Add City
          </Button>
        </Link>
      </div>

      {insights.length > 0 && (
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-foreground mb-3">Insights</h2>
          <ul className="space-y-2.5">
            {insights.map((insight) => (
              <li key={insight.id} className="flex items-start gap-2.5 text-sm text-muted">
                <span aria-hidden>{insight.icon}</span>
                <span>{insight.text}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {summaries.length === 0 ? (
        <EmptyState
          title="No cities being monitored yet"
          description="Add your first city to start tracking floor ticket prices across marketplaces."
          action={
            <Link href="/cities/add">
              <Button variant="primary">+ Add City</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {summaries.map((summary) => (
            <CityCard key={summary.citySlug} summary={summary} />
          ))}
        </div>
      )}
    </div>
  );
}
