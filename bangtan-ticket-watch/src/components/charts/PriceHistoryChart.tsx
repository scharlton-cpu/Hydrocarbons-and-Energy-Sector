"use client";

import { AreaChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { cn } from "@/lib/cn";
import { formatMoney, formatDateShort } from "@/lib/format";
import type { PriceSeriesPoint, ChartTimeFilter } from "@/lib/data-access/price-series";
import type { Currency } from "@/types/domain";

const FILTERS: { key: ChartTimeFilter; label: string }[] = [
  { key: "24h", label: "24H" },
  { key: "3d", label: "3D" },
  { key: "7d", label: "7D" },
  { key: "14d", label: "14D" },
  { key: "30d", label: "30D" },
  { key: "all", label: "All" },
];

export function PriceHistoryChart({
  data,
  currency,
  filter,
  onFilterChange,
}: {
  data: PriceSeriesPoint[];
  currency: Currency;
  filter: ChartTimeFilter;
  onFilterChange: (f: ChartTimeFilter) => void;
}) {
  const chartData = data.map((d) => ({
    ...d,
    label: filter === "24h" || filter === "3d" ? new Date(d.timestamp).toLocaleTimeString("en-US", { hour: "numeric" }) : formatDateShort(d.timestamp),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-foreground">Lowest · Median · Average price</div>
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => onFilterChange(f.key)}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                filter === f.key ? "bg-accent-soft text-accent-strong" : "text-muted hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {chartData.length < 2 ? (
        <div className="flex h-64 items-center justify-center text-sm text-muted">Not enough historical data for this range.</div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="lowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border-soft)" vertical={false} />
            <XAxis dataKey="label" stroke="var(--muted-2)" fontSize={11} tickLine={false} axisLine={false} minTickGap={24} />
            <YAxis
              stroke="var(--muted-2)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={64}
              tickFormatter={(v: number) => formatMoney(v, currency)}
            />
            <Tooltip
              contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
              labelStyle={{ color: "var(--muted)" }}
              formatter={(value, name) => [formatMoney(Number(value), currency), String(name)]}
            />
            <Area type="monotone" dataKey="low" name="Low" stroke="var(--accent)" strokeWidth={2} fill="url(#lowGradient)" />
            <Line type="monotone" dataKey="median" name="Median" stroke="var(--muted)" strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
            <Line type="monotone" dataKey="average" name="Average" stroke="var(--positive)" strokeWidth={1.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
