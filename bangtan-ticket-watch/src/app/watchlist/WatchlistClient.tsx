"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WatchCard } from "@/components/dashboard/WatchCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/states/EmptyState";
import type { Watch, Currency, SeatZoneCategory } from "@/types/domain";

const CATEGORY_OPTIONS: { value: SeatZoneCategory; label: string }[] = [
  { value: "floor", label: "Floor" },
  { value: "lower_bowl", label: "Lower Bowl" },
  { value: "club", label: "Club" },
  { value: "upper_level", label: "Upper Level" },
  { value: "other", label: "Other" },
];

const inputClass =
  "w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-muted-2 focus:outline-none focus:ring-2 focus:ring-accent/50";
const labelClass = "text-xs font-medium text-muted mb-1.5 block";

export function WatchlistClient({
  watches,
  cities,
}: {
  watches: Watch[];
  cities: { id: string; slug: string; name: string; currency: Currency }[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [cityId, setCityId] = useState(cities[0]?.id ?? "");
  const [zones, setZones] = useState<SeatZoneCategory[]>(["floor"]);
  const [quantity, setQuantity] = useState("1");
  const [maxPrice, setMaxPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const cityById = new Map(cities.map((c) => [c.id, c]));

  function toggleZone(z: SeatZoneCategory) {
    setZones((prev) => (prev.includes(z) ? prev.filter((x) => x !== z) : [...prev, z]));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !cityId || zones.length === 0 || !maxPrice) return;
    setSubmitting(true);
    const city = cityById.get(cityId);
    await fetch("/api/watches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        cityId,
        seatZoneCategories: zones,
        quantity: Number(quantity) || 1,
        maxPrice: Number(maxPrice),
        currency: city?.currency ?? "USD",
      }),
    });
    setSubmitting(false);
    setShowForm(false);
    setName("");
    setMaxPrice("");
    router.refresh();
  }

  async function handlePause(id: string) {
    await fetch(`/api/watches/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "paused" }) });
    router.refresh();
  }
  async function handleResume(id: string) {
    await fetch(`/api/watches/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "active" }) });
    router.refresh();
  }
  async function handleDelete(id: string) {
    await fetch(`/api/watches/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant={showForm ? "secondary" : "primary"} onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "+ New Watch"}
        </Button>
      </div>

      {showForm && (
        <Card className="p-5">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Watch name</label>
                <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. LA Floor Hunt" required />
              </div>
              <div>
                <label className={labelClass}>City</label>
                <select className={inputClass} value={cityId} onChange={(e) => setCityId(e.target.value)}>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Quantity</label>
                <input type="number" min={1} className={inputClass} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Max price (all-in)</label>
                <input type="number" min={0} className={inputClass} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} required />
              </div>
            </div>
            <div>
              <label className={labelClass}>Seat zones</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_OPTIONS.map((z) => (
                  <label key={z.value} className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={zones.includes(z.value)} onChange={() => toggleZone(z.value)} />
                    {z.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating…" : "Create Watch"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {watches.length === 0 ? (
        <EmptyState title="No watches yet" description="Create a watch to get alerted when matching tickets hit your target price." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {watches.map((w) => (
            <WatchCard
              key={w.id}
              watch={w}
              cityName={cityById.get(w.cityId)?.name ?? "Unknown"}
              onPause={handlePause}
              onResume={handleResume}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
