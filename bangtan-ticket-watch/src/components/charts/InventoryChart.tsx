"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { formatDateShort } from "@/lib/format";
import type { PriceSeriesPoint } from "@/lib/data-access/price-series";

export function InventoryChart({ data }: { data: PriceSeriesPoint[] }) {
  const chartData = data.map((d) => ({ ...d, label: formatDateShort(d.timestamp) }));

  if (chartData.length < 2) {
    return <div className="flex h-48 items-center justify-center text-sm text-muted">Not enough historical data for this range.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--border-soft)" vertical={false} />
        <XAxis dataKey="label" stroke="var(--muted-2)" fontSize={11} tickLine={false} axisLine={false} minTickGap={24} />
        <YAxis stroke="var(--muted-2)" fontSize={11} tickLine={false} axisLine={false} width={32} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
          labelStyle={{ color: "var(--muted)" }}
          formatter={(value) => [`${value} listings`, "Inventory"]}
        />
        <Bar dataKey="inventory" fill="var(--accent)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
