import { getWatches } from "@/lib/data-access/watches";
import { getStore } from "@/lib/demo-data/store";
import { WatchlistClient } from "./WatchlistClient";

export default function WatchlistPage() {
  const watches = getWatches();
  const store = getStore();
  const cities = store.cities.map((c) => {
    const event = store.events.find((e) => e.cityId === c.id);
    return { id: c.id, slug: c.slug, name: c.name, currency: event?.currency ?? "USD" as const };
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Watchlist</h1>
        <p className="text-sm text-muted mt-1">Configurations that trigger alerts when matching tickets hit your target price.</p>
      </div>
      <WatchlistClient watches={watches} cities={cities} />
    </div>
  );
}
