"use client";

import { cn } from "@/lib/cn";
import { formatDateShort } from "@/lib/format";

export function DateSelector({
  dates,
  selected,
  onChange,
}: {
  dates: { eventId: string; date: string }[];
  selected: string | null;
  onChange: (eventId: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={cn(
          "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
          selected === null ? "border-accent bg-accent-soft text-accent-strong" : "border-border text-muted hover:text-foreground"
        )}
      >
        All Dates
      </button>
      {dates.map((d) => (
        <button
          key={d.eventId}
          type="button"
          onClick={() => onChange(d.eventId)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            selected === d.eventId ? "border-accent bg-accent-soft text-accent-strong" : "border-border text-muted hover:text-foreground"
          )}
        >
          {formatDateShort(d.date)}
        </button>
      ))}
    </div>
  );
}
