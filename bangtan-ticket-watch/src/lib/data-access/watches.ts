import { getStore } from "@/lib/demo-data/store";
import type { Watch, WatchStatus } from "@/types/domain";

const DEMO_USER_ID = "demo-user";

export function getWatches(): Watch[] {
  return getStore().watches.filter((w) => w.status !== "deleted");
}

export function getWatch(id: string): Watch | null {
  return getStore().watches.find((w) => w.id === id) ?? null;
}

export interface CreateWatchInput {
  name: string;
  cityId: string;
  concertEventIds: string[] | "all";
  seatZoneCategories: Watch["seatZoneCategories"];
  quantity: number;
  maxPrice: number;
  currency: Watch["currency"];
}

export function createWatch(input: CreateWatchInput): Watch {
  const store = getStore();
  const watch: Watch = {
    id: `watch-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    userId: DEMO_USER_ID,
    status: "active",
    createdAt: new Date().toISOString(),
    ...input,
  };
  store.watches.push(watch);
  return watch;
}

export function updateWatchStatus(id: string, status: WatchStatus): Watch | null {
  const watch = getStore().watches.find((w) => w.id === id);
  if (!watch) return null;
  watch.status = status;
  return watch;
}

export function updateWatch(id: string, updates: Partial<CreateWatchInput>): Watch | null {
  const watch = getStore().watches.find((w) => w.id === id);
  if (!watch) return null;
  Object.assign(watch, updates);
  return watch;
}
