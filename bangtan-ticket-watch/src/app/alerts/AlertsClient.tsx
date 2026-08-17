"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/states/EmptyState";
import type { AlertEvent, AlertRule, AlertRuleType, SeatZoneCategory } from "@/types/domain";

const RULE_TYPE_OPTIONS: { value: AlertRuleType; label: string; needsPrice?: boolean; needsPercent?: boolean }[] = [
  { value: "price_below", label: "Any floor ticket falls below a price", needsPrice: true },
  { value: "zone_price_below", label: "A specific zone falls below a price", needsPrice: true },
  { value: "percent_drop", label: "Any ticket drops by at least X%", needsPercent: true },
  { value: "new_listing_below", label: "A new listing appears below a price", needsPrice: true },
  { value: "below_comparable_pct", label: "A listing is X% below comparable tickets", needsPercent: true },
];

const inputClass =
  "w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-muted-2 focus:outline-none focus:ring-2 focus:ring-accent/50";
const labelClass = "text-xs font-medium text-muted mb-1.5 block";

export function AlertsClient({
  events,
  rules,
  cities,
}: {
  events: AlertEvent[];
  rules: AlertRule[];
  cities: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<AlertRuleType>("price_below");
  const [cityId, setCityId] = useState<string>("");
  const [zone, setZone] = useState<SeatZoneCategory | "">("floor");
  const [price, setPrice] = useState("");
  const [percent, setPercent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const cityById = new Map(cities.map((c) => [c.id, c]));
  const activeOption = RULE_TYPE_OPTIONS.find((o) => o.value === type);

  async function markRead(id: string) {
    await fetch("/api/alerts/read", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    router.refresh();
  }

  async function markAllRead() {
    await fetch("/api/alerts/read", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ all: true }) });
    router.refresh();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await fetch("/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        cityId: cityId || undefined,
        seatZoneCategory: zone || undefined,
        thresholdPrice: activeOption?.needsPrice ? Number(price) : undefined,
        thresholdPercent: activeOption?.needsPercent ? Number(percent) : undefined,
      }),
    });
    setSubmitting(false);
    setShowForm(false);
    setPrice("");
    setPercent("");
    router.refresh();
  }

  async function toggleRule(id: string, active: boolean) {
    await fetch(`/api/alerts/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active }) });
    router.refresh();
  }
  async function deleteRule(id: string) {
    await fetch(`/api/alerts/${id}`, { method: "DELETE" });
    router.refresh();
  }

  const unreadCount = events.filter((e) => !e.read).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-foreground">Triggered Alerts</h2>
          {unreadCount > 0 && <Badge variant="accent">{unreadCount} new</Badge>}
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead}>
              Mark all read
            </Button>
          )}
          <Button variant={showForm ? "secondary" : "primary"} size="sm" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Cancel" : "+ New Alert Rule"}
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="p-5">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className={labelClass}>Alert me when…</label>
              <select className={inputClass} value={type} onChange={(e) => setType(e.target.value as AlertRuleType)}>
                {RULE_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={labelClass}>City (optional)</label>
                <select className={inputClass} value={cityId} onChange={(e) => setCityId(e.target.value)}>
                  <option value="">Any city</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Seat zone (optional)</label>
                <select className={inputClass} value={zone} onChange={(e) => setZone(e.target.value as SeatZoneCategory)}>
                  <option value="">Any zone</option>
                  <option value="floor">Floor</option>
                  <option value="lower_bowl">Lower Bowl</option>
                  <option value="club">Club</option>
                  <option value="upper_level">Upper Level</option>
                </select>
              </div>
              {activeOption?.needsPrice && (
                <div>
                  <label className={labelClass}>Price threshold</label>
                  <input type="number" min={0} className={inputClass} value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
              )}
              {activeOption?.needsPercent && (
                <div>
                  <label className={labelClass}>Percent threshold</label>
                  <input type="number" min={0} max={100} className={inputClass} value={percent} onChange={(e) => setPercent(e.target.value)} required />
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating…" : "Create Alert"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {events.length === 0 ? (
        <EmptyState icon="🔔" title="No alerts triggered yet" description="Create an alert rule and we'll notify you here the moment a matching listing appears." />
      ) : (
        <div className="space-y-2">
          {events.map((e) => (
            <AlertCard key={e.id} event={e} onMarkRead={markRead} />
          ))}
        </div>
      )}

      {rules.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">Alert Rules</h2>
          <div className="space-y-2">
            {rules.map((r) => (
              <Card key={r.id} className="p-4 flex items-center justify-between">
                <div className="text-sm text-foreground">
                  {ruleSummary(r, cityById)}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleRule(r.id, !r.active)}
                    className="text-xs text-muted hover:text-foreground"
                  >
                    {r.active ? "Pause" : "Resume"}
                  </button>
                  <button type="button" onClick={() => deleteRule(r.id)} className="text-xs text-muted hover:text-negative">
                    Delete
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ruleSummary(rule: AlertRule, cityById: Map<string, { name: string }>) {
  const scope = rule.cityId ? cityById.get(rule.cityId)?.name ?? "a city" : "any city";
  const zone = rule.seatZoneCategory ? ` (${rule.seatZoneCategory.replace("_", " ")})` : "";
  switch (rule.type) {
    case "price_below":
    case "zone_price_below":
      return `${scope}${zone}: alert when price falls below ${rule.thresholdPrice}`;
    case "percent_drop":
      return `${scope}${zone}: alert on drops of ${rule.thresholdPercent}%+`;
    case "new_listing_below":
      return `${scope}${zone}: alert on new listings below ${rule.thresholdPrice}`;
    case "below_comparable_pct":
      return `${scope}${zone}: alert when ${rule.thresholdPercent}%+ below comparable listings`;
    default:
      return `${scope}${zone}: ${rule.type}`;
  }
}
