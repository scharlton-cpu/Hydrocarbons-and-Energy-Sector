"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_CONFIG } from "@/config/app.config";
import type { Currency, ProviderId, SeatZoneCategory } from "@/types/domain";

const CATEGORY_OPTIONS: { value: SeatZoneCategory; label: string }[] = [
  { value: "floor", label: "Floor" },
  { value: "lower_bowl", label: "Lower Bowl" },
  { value: "club", label: "Club" },
  { value: "upper_level", label: "Upper Level" },
  { value: "other", label: "Other" },
];

const PROVIDER_OPTIONS: { value: ProviderId; label: string }[] = [
  { value: "tickpick", label: "TickPick" },
  { value: "stubhub", label: "StubHub" },
  { value: "seatgeek", label: "SeatGeek" },
];

const inputClass =
  "w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-muted-2 focus:outline-none focus:ring-2 focus:ring-accent/50";
const labelClass = "text-xs font-medium text-muted mb-1.5 block";

export function AddCityForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [artistName, setArtistName] = useState("BTS");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [venue, setVenue] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [dates, setDates] = useState<string[]>([""]);
  const [seatingAreas, setSeatingAreas] = useState<{ name: string; category: SeatZoneCategory }[]>([
    { name: "Floor A", category: "floor" },
  ]);
  const [targetPrice, setTargetPrice] = useState("");
  const [ticketsNeeded, setTicketsNeeded] = useState("1");
  const [providers, setProviders] = useState<ProviderId[]>(["tickpick", "stubhub", "seatgeek"]);

  function updateDate(i: number, value: string) {
    setDates((prev) => prev.map((d, idx) => (idx === i ? value : d)));
  }
  function addDate() {
    setDates((prev) => [...prev, ""]);
  }
  function removeDate(i: number) {
    setDates((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateZone(i: number, patch: Partial<{ name: string; category: SeatZoneCategory }>) {
    setSeatingAreas((prev) => prev.map((z, idx) => (idx === i ? { ...z, ...patch } : z)));
  }
  function addZone() {
    setSeatingAreas((prev) => [...prev, { name: "", category: "floor" }]);
  }
  function removeZone(i: number) {
    setSeatingAreas((prev) => prev.filter((_, idx) => idx !== i));
  }

  function toggleProvider(id: ProviderId) {
    setProviders((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanedDates = dates.map((d) => d.trim()).filter(Boolean);
    const cleanedZones = seatingAreas.filter((z) => z.name.trim());

    if (!city.trim() || !country.trim() || !venue.trim() || cleanedDates.length === 0 || cleanedZones.length === 0) {
      setError("City, country, venue, at least one date, and at least one seating area are required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistName,
          city,
          country,
          venue,
          currency,
          dates: cleanedDates,
          seatingAreas: cleanedZones,
          targetPrice: targetPrice ? Number(targetPrice) : undefined,
          ticketsNeeded: Number(ticketsNeeded) || 1,
          providers,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to add city");
      }
      const data = await res.json();
      router.push(`/cities/${data.citySlug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="rounded-xl border border-negative/30 bg-negative-soft px-4 py-3 text-sm text-negative">{error}</div>}

      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Event details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Artist</label>
            <input className={inputClass} value={artistName} onChange={(e) => setArtistName(e.target.value)} placeholder={APP_CONFIG.defaultArtistSlug.toUpperCase()} />
          </div>
          <div>
            <label className={labelClass}>Currency</label>
            <select className={inputClass} value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}>
              <option value="USD">USD</option>
              <option value="CAD">CAD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>City</label>
            <input className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. New York" required />
          </div>
          <div>
            <label className={labelClass}>Country</label>
            <input className={inputClass} value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. USA" required />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Venue</label>
            <input className={inputClass} value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="e.g. MetLife Stadium" required />
          </div>
        </div>
      </Card>

      <Card className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Concert dates</h2>
          <Button type="button" variant="secondary" size="sm" onClick={addDate}>
            + Add date
          </Button>
        </div>
        <div className="space-y-2">
          {dates.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="date" className={inputClass} value={d} onChange={(e) => updateDate(i, e.target.value)} />
              {dates.length > 1 && (
                <Button type="button" variant="ghost" size="sm" onClick={() => removeDate(i)}>
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Seating areas</h2>
          <Button type="button" variant="secondary" size="sm" onClick={addZone}>
            + Add zone
          </Button>
        </div>
        <div className="space-y-2">
          {seatingAreas.map((z, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                className={inputClass}
                value={z.name}
                onChange={(e) => updateZone(i, { name: e.target.value })}
                placeholder="e.g. Floor A, Section 101"
              />
              <select className={inputClass} value={z.category} onChange={(e) => updateZone(i, { category: e.target.value as SeatZoneCategory })}>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              {seatingAreas.length > 1 && (
                <Button type="button" variant="ghost" size="sm" onClick={() => removeZone(i)}>
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Monitoring preferences</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Tickets needed</label>
            <input type="number" min={1} className={inputClass} value={ticketsNeeded} onChange={(e) => setTicketsNeeded(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Target price (per ticket, all-in)</label>
            <input type="number" min={0} className={inputClass} value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} placeholder="e.g. 1200" />
          </div>
        </div>
        <div>
          <label className={labelClass}>Marketplaces to monitor</label>
          <div className="flex flex-wrap gap-2">
            {PROVIDER_OPTIONS.map((p) => (
              <label
                key={p.value}
                className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm cursor-pointer"
              >
                <input type="checkbox" checked={providers.includes(p.value)} onChange={() => toggleProvider(p.value)} />
                {p.label}
              </label>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted">
          If a target price is set, we&apos;ll automatically create a watch and an in-app alert for when a matching listing drops below it.
        </p>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" variant="primary" size="lg" disabled={submitting}>
          {submitting ? "Adding city…" : "Add City"}
        </Button>
      </div>
    </form>
  );
}
