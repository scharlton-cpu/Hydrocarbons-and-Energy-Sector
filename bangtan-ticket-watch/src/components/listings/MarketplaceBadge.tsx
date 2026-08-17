import { cn } from "@/lib/cn";
import type { ProviderId } from "@/types/domain";

const PROVIDER_LABEL: Record<ProviderId, string> = {
  tickpick: "TickPick",
  stubhub: "StubHub",
  seatgeek: "SeatGeek",
};

const PROVIDER_DOT: Record<ProviderId, string> = {
  tickpick: "bg-emerald-400",
  stubhub: "bg-sky-400",
  seatgeek: "bg-amber-400",
};

export function MarketplaceBadge({ provider, className }: { provider: ProviderId; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium text-foreground", className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", PROVIDER_DOT[provider])} />
      {PROVIDER_LABEL[provider]}
    </span>
  );
}
