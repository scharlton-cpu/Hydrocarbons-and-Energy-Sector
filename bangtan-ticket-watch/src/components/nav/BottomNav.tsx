"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";
import { cn } from "@/lib/cn";

const MOBILE_ITEMS = NAV_ITEMS.filter((i) => ["/", "/watchlist", "/cities", "/alerts", "/favorites"].includes(i.href));

export function BottomNav({ unreadAlertCount }: { unreadAlertCount: number }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface/95 backdrop-blur-sm md:hidden">
      {MOBILE_ITEMS.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium",
              active ? "text-accent-strong" : "text-muted-2"
            )}
          >
            <Icon size={19} strokeWidth={2} />
            {item.label}
            {item.href === "/alerts" && unreadAlertCount > 0 && (
              <span className="absolute right-[26%] top-1.5 h-2 w-2 rounded-full bg-accent" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
