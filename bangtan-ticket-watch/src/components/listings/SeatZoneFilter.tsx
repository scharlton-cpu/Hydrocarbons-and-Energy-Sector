"use client";

import { cn } from "@/lib/cn";
import type { SeatZoneCategory } from "@/types/domain";

const ZONE_LABEL: Record<SeatZoneCategory, string> = {
  floor: "Floor",
  lower_bowl: "Lower Bowl",
  club: "Club",
  upper_level: "Upper Level",
  other: "Other",
};

export function SeatZoneFilter({
  available,
  selected,
  onChange,
}: {
  available: SeatZoneCategory[];
  selected: SeatZoneCategory[];
  onChange: (next: SeatZoneCategory[]) => void;
}) {
  function toggle(zone: SeatZoneCategory) {
    onChange(selected.includes(zone) ? selected.filter((z) => z !== zone) : [...selected, zone]);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {available.map((zone) => {
        const active = selected.includes(zone);
        return (
          <button
            key={zone}
            type="button"
            onClick={() => toggle(zone)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              active ? "border-accent bg-accent-soft text-accent-strong" : "border-border text-muted hover:text-foreground"
            )}
          >
            {ZONE_LABEL[zone]}
          </button>
        );
      })}
    </div>
  );
}
