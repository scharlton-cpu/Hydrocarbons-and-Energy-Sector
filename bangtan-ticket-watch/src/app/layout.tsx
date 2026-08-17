import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NavShell } from "@/components/nav/NavShell";
import { APP_CONFIG } from "@/config/app.config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: APP_CONFIG.productName,
  description: APP_CONFIG.tagline,
};

// The whole app reads from a mutable in-memory demo data store (see
// src/lib/demo-data/store.ts) — watches/alerts/favorites created through
// the UI, and admin actions like manual refresh, must be reflected on the
// next request. Force every route to render dynamically so nothing gets
// frozen into a stale build-time snapshot.
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NavShell>{children}</NavShell>
      </body>
    </html>
  );
}
