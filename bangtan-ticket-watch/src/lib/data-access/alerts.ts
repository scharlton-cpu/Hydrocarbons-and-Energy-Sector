import { getStore } from "@/lib/demo-data/store";
import { buildListingViewsForEvent } from "./listing-view";
import { formatMoney } from "@/lib/format";
import type { AlertEvent, AlertRule, AlertRuleType, SeatZoneCategory } from "@/types/domain";
import type { ListingView } from "./view-types";

const DEMO_USER_ID = "demo-user";

export function getAlertRules(): AlertRule[] {
  return getStore().alertRules;
}

export interface CreateAlertRuleInput {
  watchId?: string;
  cityId?: string;
  concertEventId?: string;
  seatZoneCategory?: SeatZoneCategory;
  type: AlertRuleType;
  thresholdPrice?: number;
  thresholdPercent?: number;
}

export function createAlertRule(input: CreateAlertRuleInput): AlertRule {
  const store = getStore();
  const rule: AlertRule = {
    id: `alert-rule-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    userId: DEMO_USER_ID,
    active: true,
    createdAt: new Date().toISOString(),
    ...input,
  };
  store.alertRules.push(rule);
  return rule;
}

export function setAlertRuleActive(id: string, active: boolean): AlertRule | null {
  const rule = getStore().alertRules.find((r) => r.id === id);
  if (!rule) return null;
  rule.active = active;
  return rule;
}

export function deleteAlertRule(id: string): void {
  const store = getStore();
  store.alertRules = store.alertRules.filter((r) => r.id !== id);
}

/**
 * Evaluates every active rule against current listing data and records any
 * new matches as AlertEvents (deduped by rule+listing so re-evaluating on
 * every page load doesn't spam duplicates). This stands in for what a
 * background refresh job would do in production after each provider sync.
 */
export function evaluateAlerts(now: Date = new Date()): AlertEvent[] {
  const store = getStore();
  const rules = store.alertRules.filter((r) => r.active);
  if (rules.length === 0) return store.alertEvents;

  const alreadyAlerted = new Set(store.alertEvents.map((e) => `${e.ruleId}:${e.listingId ?? ""}`));

  for (const event of store.events) {
    const views = buildListingViewsForEvent(event.id, now);
    for (const rule of rules) {
      if (rule.cityId && rule.cityId !== event.cityId) continue;
      if (rule.concertEventId && rule.concertEventId !== event.id) continue;

      for (const view of views) {
        if (rule.seatZoneCategory && view.listing.seatType !== rule.seatZoneCategory) continue;
        const key = `${rule.id}:${view.listing.listingId}`;
        if (alreadyAlerted.has(key)) continue;

        const message = matchRule(rule, view);
        if (message) {
          store.alertEvents.push({
            id: `alert-evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
            ruleId: rule.id,
            listingId: view.listing.listingId,
            message,
            triggeredAt: now.toISOString(),
            read: false,
          });
          alreadyAlerted.add(key);
        }
      }
    }
  }

  return store.alertEvents;
}

function matchRule(rule: AlertRule, view: ListingView): string | null {
  const { listing, priceChange, dealScore } = view;
  switch (rule.type) {
    case "price_below":
    case "zone_price_below":
      if (rule.thresholdPrice !== undefined && listing.allInPrice < rule.thresholdPrice) {
        return `${listing.section} on ${listing.provider} fell below ${formatMoney(rule.thresholdPrice, listing.currency)} — now ${formatMoney(listing.allInPrice, listing.currency)}.`;
      }
      return null;
    case "percent_drop": {
      const pct = priceChange?.percentChange7d ?? priceChange?.percentChange ?? 0;
      if (rule.thresholdPercent !== undefined && -pct >= rule.thresholdPercent) {
        return `${listing.section} on ${listing.provider} dropped ${Math.abs(pct).toFixed(1)}% — now ${formatMoney(listing.allInPrice, listing.currency)}.`;
      }
      return null;
    }
    case "new_listing_below": {
      const isNew = Date.now() - new Date(listing.firstSeenAt).getTime() < 24 * 60 * 60 * 1000;
      if (isNew && rule.thresholdPrice !== undefined && listing.allInPrice < rule.thresholdPrice) {
        return `New listing: ${listing.section} on ${listing.provider} at ${formatMoney(listing.allInPrice, listing.currency)}.`;
      }
      return null;
    }
    case "below_comparable_pct":
      if (rule.thresholdPercent !== undefined && dealScore.percentBelowMedian >= rule.thresholdPercent) {
        return `${listing.section} on ${listing.provider} is ${dealScore.percentBelowMedian.toFixed(0)}% below comparable listings — ${formatMoney(listing.allInPrice, listing.currency)}.`;
      }
      return null;
    case "inventory_spike":
      return null; // evaluated at the city level, see evaluateInventorySpikes below
    default:
      return null;
  }
}

export function markAlertEventRead(id: string): void {
  const event = getStore().alertEvents.find((e) => e.id === id);
  if (event) event.read = true;
}

export function markAllAlertEventsRead(): void {
  for (const event of getStore().alertEvents) event.read = true;
}

export function getAlertEvents(now: Date = new Date()): AlertEvent[] {
  const events = evaluateAlerts(now);
  return [...events].sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime());
}

export function getUnreadAlertCount(): number {
  evaluateAlerts();
  return getStore().alertEvents.filter((e) => !e.read).length;
}
