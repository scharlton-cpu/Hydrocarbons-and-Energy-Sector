"use client";

import { cn } from "@/lib/cn";

export function CitySelector({
  cities,
  selectedSlug,
  onChange,
}: {
  cities: { slug: string; name: string }[];
  selectedSlug: string | null;
  onChange: (slug: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={cn(
          "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
          selectedSlug === null ? "border-accent bg-accent-soft text-accent-strong" : "border-border text-muted hover:text-foreground"
        )}
      >
        All Cities
      </button>
      {cities.map((c) => (
        <button
          key={c.slug}
          type="button"
          onClick={() => onChange(c.slug)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            selectedSlug === c.slug ? "border-accent bg-accent-soft text-accent-strong" : "border-border text-muted hover:text-foreground"
          )}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
