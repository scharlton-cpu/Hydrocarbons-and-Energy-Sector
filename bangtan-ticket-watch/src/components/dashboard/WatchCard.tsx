"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import type { Watch } from "@/types/domain";

const ZONE_LABEL: Record<string, string> = {
  floor: "Floor",
  lower_bowl: "Lower Bowl",
  club: "Club",
  upper_level: "Upper Level",
  other: "Other",
};

export function WatchCard({
  watch,
  cityName,
  onPause,
  onResume,
  onDelete,
}: {
  watch: Watch;
  cityName: string;
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-foreground">{watch.name}</h3>
          <p className="text-xs text-muted mt-0.5">
            {cityName} · {watch.concertEventIds === "all" ? "All dates" : `${watch.concertEventIds.length} date(s)`}
          </p>
        </div>
        <Badge variant={watch.status === "active" ? "positive" : watch.status === "paused" ? "warning" : "neutral"}>
          {watch.status}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {watch.seatZoneCategories.map((z) => (
          <Badge key={z} variant="neutral">
            {ZONE_LABEL[z] ?? z}
          </Badge>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-soft">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-muted-2">Max Price</div>
          <div className="font-mono text-lg font-semibold">{formatMoney(watch.maxPrice, watch.currency)}</div>
        </div>
        <div className="text-right">
          <div className="text-[11px] uppercase tracking-wide text-muted-2">Quantity</div>
          <div className="font-mono text-lg font-semibold">{watch.quantity}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4">
        {watch.status === "active" && onPause && (
          <Button variant="secondary" size="sm" onClick={() => onPause(watch.id)}>
            Pause
          </Button>
        )}
        {watch.status === "paused" && onResume && (
          <Button variant="secondary" size="sm" onClick={() => onResume(watch.id)}>
            Resume
          </Button>
        )}
        {onDelete && (
          <Button variant="ghost" size="sm" onClick={() => onDelete(watch.id)}>
            Delete
          </Button>
        )}
      </div>
    </Card>
  );
}
