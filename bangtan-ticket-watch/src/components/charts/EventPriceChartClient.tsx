"use client";

import { useMemo, useState } from "react";
import { PriceHistoryChart } from "./PriceHistoryChart";
import { InventoryChart } from "./InventoryChart";
import type { ChartTimeFilter, PriceSeriesPoint } from "@/lib/data-access/price-series";
import type { Currency } from "@/types/domain";

const WINDOW_HOURS: Record<ChartTimeFilter, number> = {
  "24h": 24,
  "3d": 72,
  "7d": 168,
  "14d": 336,
  "30d": 720,
  all: Infinity,
};

export function EventPriceChartClient({ fullSeries, currency }: { fullSeries: PriceSeriesPoint[]; currency: Currency }) {
  const [filter, setFilter] = useState<ChartTimeFilter>("7d");
  // Captured once on mount rather than read inline during render, per
  // React's purity rules (Date.now() is an impure call).
  const [nowMs] = useState(() => Date.now());

  const windowed = useMemo(() => {
    const hours = WINDOW_HOURS[filter];
    if (!Number.isFinite(hours)) return fullSeries;
    const cutoff = nowMs - hours * 60 * 60 * 1000;
    return fullSeries.filter((p) => new Date(p.timestamp).getTime() >= cutoff);
  }, [fullSeries, filter, nowMs]);

  return (
    <div className="space-y-6">
      <PriceHistoryChart data={windowed} currency={currency} filter={filter} onFilterChange={setFilter} />
      <div>
        <div className="text-sm font-medium text-foreground mb-3">Inventory volume</div>
        <InventoryChart data={windowed} />
      </div>
    </div>
  );
}
