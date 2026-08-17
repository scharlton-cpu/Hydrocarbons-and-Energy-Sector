import type { PriceSnapshot } from "@/types/domain";

export interface PriceChangeSummary {
  current: number;
  previous: number;
  initial: number;
  price24hAgo: number | null;
  high7d: number;
  low7d: number;
  dollarChange: number;
  percentChange: number; // vs previous snapshot
  percentChange24h: number | null;
  percentChange7d: number | null;
}

/** `snapshots` must be sorted oldest -> newest. */
export function summarizePriceHistory(snapshots: PriceSnapshot[], now: Date = new Date()): PriceChangeSummary | null {
  if (snapshots.length === 0) return null;

  const current = snapshots[snapshots.length - 1].allInPrice;
  const previous = snapshots.length > 1 ? snapshots[snapshots.length - 2].allInPrice : current;
  const initial = snapshots[0].allInPrice;

  const dayAgoMs = now.getTime() - 24 * 60 * 60 * 1000;
  const sevenDaysAgoMs = now.getTime() - 7 * 24 * 60 * 60 * 1000;

  const price24hAgo = closestPriceAtOrBefore(snapshots, dayAgoMs);
  const last7d = snapshots.filter((s) => new Date(s.capturedAt).getTime() >= sevenDaysAgoMs);
  const windowFor7d = last7d.length > 0 ? last7d : snapshots;
  const high7d = Math.max(...windowFor7d.map((s) => s.allInPrice));
  const low7d = Math.min(...windowFor7d.map((s) => s.allInPrice));
  const price7dAgo = closestPriceAtOrBefore(snapshots, sevenDaysAgoMs);

  const dollarChange = round2(current - previous);
  const percentChange = previous !== 0 ? round2(((current - previous) / previous) * 100) : 0;
  const percentChange24h = price24hAgo !== null && price24hAgo !== 0 ? round2(((current - price24hAgo) / price24hAgo) * 100) : null;
  const percentChange7d = price7dAgo !== null && price7dAgo !== 0 ? round2(((current - price7dAgo) / price7dAgo) * 100) : null;

  return {
    current,
    previous,
    initial,
    price24hAgo,
    high7d,
    low7d,
    dollarChange,
    percentChange,
    percentChange24h,
    percentChange7d,
  };
}

function closestPriceAtOrBefore(snapshots: PriceSnapshot[], targetMs: number): number | null {
  let best: PriceSnapshot | null = null;
  for (const s of snapshots) {
    const t = new Date(s.capturedAt).getTime();
    if (t <= targetMs) {
      if (!best || t > new Date(best.capturedAt).getTime()) best = s;
    }
  }
  return best ? best.allInPrice : null;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : round2((sorted[mid - 1] + sorted[mid]) / 2);
}

export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return round2(values.reduce((a, b) => a + b, 0) / values.length);
}
