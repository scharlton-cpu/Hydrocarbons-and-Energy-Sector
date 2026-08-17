import type { ProviderId } from "@/types/domain";
import { BaseMockProvider } from "./base";
import { TickPickProvider } from "./tickpick";
import { StubHubProvider } from "./stubhub";
import { SeatGeekProvider } from "./seatgeek";

const instances: Record<ProviderId, BaseMockProvider> = {
  tickpick: new TickPickProvider(),
  stubhub: new StubHubProvider(),
  seatgeek: new SeatGeekProvider(),
};

/**
 * Enable/disable flags. In-memory for the MVP (mirrors `providers.enabled`
 * in the Prisma schema) — the admin panel toggles this at runtime. A
 * disabled provider is skipped everywhere: dashboards, refresh jobs, and
 * listing tables all treat its listings as absent, so one bad marketplace
 * integration never takes down the rest of the app.
 *
 * Cached on `globalThis` rather than a plain module-level object — Next.js
 * compiles each route into its own server bundle, so a toggle made from
 * the admin panel's API route wouldn't be visible to a page in a different
 * bundle otherwise. See the matching comment in src/lib/demo-data/store.ts.
 */
const globalForProviders = globalThis as unknown as { __providerEnabledState?: Record<ProviderId, boolean> };
if (!globalForProviders.__providerEnabledState) {
  globalForProviders.__providerEnabledState = { tickpick: true, stubhub: true, seatgeek: true };
}
const enabledState = globalForProviders.__providerEnabledState;

export function getProvider(id: ProviderId): BaseMockProvider {
  return instances[id];
}

export function getAllProviders(): BaseMockProvider[] {
  return Object.values(instances);
}

export function getEnabledProviders(): BaseMockProvider[] {
  return getAllProviders().filter((p) => enabledState[p.id]);
}

export function isProviderEnabled(id: ProviderId): boolean {
  return enabledState[id];
}

export function setProviderEnabled(id: ProviderId, enabled: boolean): void {
  enabledState[id] = enabled;
}

export function getProviderStatuses() {
  return getAllProviders().map((p) => ({
    id: p.id,
    displayName: p.displayName,
    enabled: enabledState[p.id],
    isLive: p.isLive(),
  }));
}
