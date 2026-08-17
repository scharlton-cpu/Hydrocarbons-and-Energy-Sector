import type { ReactNode } from "react";
import Link from "next/link";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { DemoDataBadge } from "@/components/ui/demo-data-badge";
import { getUnreadAlertCount } from "@/lib/data-access/alerts";
import { APP_CONFIG } from "@/config/app.config";

export function NavShell({ children }: { children: ReactNode }) {
  const unreadAlertCount = getUnreadAlertCount();

  return (
    <div className="flex min-h-screen">
      <Sidebar unreadAlertCount={unreadAlertCount} />
      <div className="flex min-w-0 flex-1 flex-col pb-16 md:pb-0">
        <header className="flex items-center justify-between border-b border-border px-4 py-3 md:px-8">
          <Link href="/" className="text-sm font-semibold text-foreground md:hidden">
            {APP_CONFIG.productName}
          </Link>
          <span className="hidden text-xs text-muted md:inline">{APP_CONFIG.tagline}</span>
          <DemoDataBadge />
        </header>
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
      <BottomNav unreadAlertCount={unreadAlertCount} />
    </div>
  );
}
