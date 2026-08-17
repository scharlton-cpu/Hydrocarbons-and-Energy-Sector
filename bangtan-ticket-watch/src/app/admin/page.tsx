import Link from "next/link";
import { getProviders, getRefreshInfo, getCatalogCounts } from "@/lib/data-access/admin";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminClient } from "./AdminClient";

export default function AdminPage() {
  const providers = getProviders();
  const { lastRefreshAt, syncLog } = getRefreshInfo();
  const counts = getCatalogCounts();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Admin</h1>
        <p className="text-sm text-muted mt-1">Development mode tools — provider health, manual refresh, and catalog management.</p>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Catalog</h2>
            <p className="text-xs text-muted mt-1">
              {counts.cities} cities · {counts.venues} venues · {counts.seatZones} seat zones · {counts.events} events ·{" "}
              {counts.listings} listings
            </p>
          </div>
          <Link href="/cities/add">
            <Button variant="secondary" size="sm">
              + Add City / Venue / Date
            </Button>
          </Link>
        </div>
      </Card>

      <AdminClient providers={providers} lastRefreshAt={lastRefreshAt} syncLog={syncLog} />
    </div>
  );
}
