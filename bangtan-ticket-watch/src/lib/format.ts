import type { Currency } from "@/types/domain";

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  CAD: "CAD $",
  EUR: "€",
  GBP: "£",
};

export function formatMoney(amount: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  return `${symbol}${Math.round(amount).toLocaleString("en-US")}`;
}

export function formatPercent(pct: number | null, opts: { withSign?: boolean } = {}): string {
  if (pct === null || Number.isNaN(pct)) return "—";
  const withSign = opts.withSign ?? true;
  const sign = withSign && pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00Z" : ""));
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00Z" : ""));
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  const diffMs = now.getTime() - then;
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d ago`;
}
