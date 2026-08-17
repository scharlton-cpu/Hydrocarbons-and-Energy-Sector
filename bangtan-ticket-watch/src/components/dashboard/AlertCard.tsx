"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { AlertEvent } from "@/types/domain";

export function AlertCard({ event, onMarkRead }: { event: AlertEvent; onMarkRead?: (id: string) => void }) {
  return (
    <Card
      className={cn("p-4 flex items-start justify-between gap-3", !event.read && "border-accent/40 bg-accent-soft/30")}
      onClick={() => !event.read && onMarkRead?.(event.id)}
    >
      <div className="flex items-start gap-3">
        {!event.read && <span className="mt-1.5 h-2 w-2 rounded-full bg-accent shrink-0" />}
        <div>
          <p className="text-sm text-foreground">{event.message}</p>
          <p className="text-xs text-muted mt-1">{formatRelativeTime(event.triggeredAt)}</p>
        </div>
      </div>
      {!event.read && <Badge variant="accent">New</Badge>}
    </Card>
  );
}
