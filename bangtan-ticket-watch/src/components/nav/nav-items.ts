import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Binoculars, MapPin, GitCompareArrows, Bell, Heart, Settings } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/watchlist", label: "Watchlist", icon: Binoculars },
  { href: "/cities", label: "Cities", icon: MapPin },
  { href: "/compare", label: "Compare", icon: GitCompareArrows },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/settings", label: "Settings", icon: Settings },
];
