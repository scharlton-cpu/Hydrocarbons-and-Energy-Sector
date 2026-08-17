import { NextResponse } from "next/server";
import { triggerManualRefresh } from "@/lib/data-access/admin";

export async function POST() {
  const syncLog = triggerManualRefresh();
  return NextResponse.json({ ok: true, syncLog });
}
