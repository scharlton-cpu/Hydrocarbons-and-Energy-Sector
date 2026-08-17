import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

export function PriceCard({
  label,
  value,
  sublabel,
  accent = false,
  trailing,
}: {
  label: string;
  value: string;
  sublabel?: string;
  accent?: boolean;
  trailing?: ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="text-[11px] uppercase tracking-wide text-muted-2">{label}</div>
      <div className={cn("font-mono text-2xl font-semibold mt-1", accent ? "text-accent-strong" : "text-foreground")}>{value}</div>
      <div className="flex items-center justify-between mt-1.5">
        {sublabel && <div className="text-xs text-muted">{sublabel}</div>}
        {trailing}
      </div>
    </Card>
  );
}
