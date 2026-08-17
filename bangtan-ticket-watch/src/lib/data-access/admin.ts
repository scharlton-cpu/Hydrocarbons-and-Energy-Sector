import { getStore } from "@/lib/demo-data/store";
import { getProviderStatuses, isProviderEnabled, setProviderEnabled } from "@/lib/providers/registry";
import type { ProviderId } from "@/types/domain";

export function triggerManualRefresh() {
  const store = getStore();
  return store.refresh(new Date());
}

export function getRefreshInfo() {
  const store = getStore();
  return { lastRefreshAt: store.lastRefreshAt, syncLog: store.providerSyncLog };
}

export function getProviders() {
  return getProviderStatuses();
}

export function toggleProvider(id: ProviderId, enabled: boolean) {
  setProviderEnabled(id, enabled);
  return isProviderEnabled(id);
}

export function getCatalogCounts() {
  const store = getStore();
  return {
    cities: store.cities.length,
    venues: store.venues.length,
    seatZones: store.seatZones.length,
    events: store.events.length,
    listings: store.listings.length,
  };
}
