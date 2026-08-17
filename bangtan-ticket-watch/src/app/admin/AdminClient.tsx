"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/format";
import type { ProviderId } from "@/types/domain";
import type { ProviderSyncLogEntry } from "@/lib/demo-data/store";

interface ProviderStatus {
  id: ProviderId;
  displayName: string;
  enabled: boolean;
  isLive: boolean;
}

export function AdminClient({
  providers,
  lastRefreshAt,
  syncLog,
}: {
  providers: ProviderStatus[];
  lastRefreshAt: string | null;
  syncLog: ProviderSyncLogEntry[];
}) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  async function toggle(id: ProviderId, enabled: boolean) {
    await fetch(`/api/providers/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled }) });
    router.refresh();
  }

  async function refreshNow() {
    setRefreshing(true);
    await fetch("/api/refresh", { method: "POST" });
    setRefreshing(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">Marketplace providers</h2>
          <Button size="sm" onClick={refreshNow} disabled={refreshing}>
            {refreshing ? "Refreshing…" : "Trigger Manual Refresh"}
          </Button>
        </div>
        <div className="space-y-2">
          {providers.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl border border-border-soft px-3 py-2.5">
              <div>
                <div className="text-sm font-medium text-foreground">{p.displayName}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant={p.isLive ? "positive" : "neutral"}>{p.isLive ? "Live credentials" : "Mock mode"}</Badge>
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
                <input type="checkbox" checked={p.enabled} onChange={(e) => toggle(p.id, e.target.checked)} />
                Enabled
              </label>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-2 mt-3">
          Disabling a provider removes it from every dashboard, listing table, and refresh cycle immediately — one bad
          integration never takes down the rest of the app.
        </p>
      </Card>

      <Card className="p-5">
        <h2 className="text-sm font-semibold text-foreground mb-3">Last sync</h2>
        {lastRefreshAt ? (
          <p className="text-sm text-muted mb-3">Last refreshed {formatRelativeTime(lastRefreshAt)}.</p>
        ) : (
          <p className="text-sm text-muted mb-3">No manual refresh has run yet this session — data reflects initial seed.</p>
        )}
        {syncLog.length > 0 && (
          <div className="space-y-1.5">
            {syncLog.map((entry) => (
              <div key={entry.providerId} className="flex items-center justify-between text-xs">
                <span className="text-foreground capitalize">{entry.providerId}</span>
                <span className="text-muted">{entry.listingCount} listings updated</span>
                <Badge variant={entry.status === "ok" ? "positive" : "negative"}>{entry.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="text-sm font-semibold text-foreground mb-2">Errors</h2>
        {syncLog.some((e) => e.status === "error") ? (
          <ul className="space-y-1 text-sm text-negative">
            {syncLog
              .filter((e) => e.status === "error")
              .map((e) => (
                <li key={e.providerId}>
                  {e.providerId}: {e.error ?? "Unknown error"}
                </li>
              ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">No errors recorded.</p>
        )}
      </Card>
    </div>
  );
}
