"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";
import { cn } from "@/lib/cn";
import { APP_CONFIG } from "@/config/app.config";
import { Wrench } from "lucide-react";

export function Sidebar({ unreadAlertCount }: { unreadAlertCount: number }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:border-border md:bg-surface/60 md:sticky md:top-0 md:h-screen">
      <div className="px-5 py-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
            {APP_CONFIG.shortName}
          </span>
          <span className="text-sm font-semibold leading-tight text-foreground">{APP_CONFIG.productName}</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-accent-soft text-accent-strong" : "text-muted hover:bg-surface-2 hover:text-foreground"
              )}
            >
              <span className="flex items-center gap-2.5">
                <Icon size={17} strokeWidth={2} />
                {item.label}
              </span>
              {item.href === "/alerts" && unreadAlertCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold text-white">
                  {unreadAlertCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-5 pt-2">
        <Link
          href="/admin"
          className={cn(
            "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium text-muted-2 transition-colors hover:bg-surface-2 hover:text-foreground",
            pathname.startsWith("/admin") && "bg-surface-2 text-foreground"
          )}
        >
          <Wrench size={15} strokeWidth={2} />
          Admin
        </Link>
      </div>
    </aside>
  );
}
