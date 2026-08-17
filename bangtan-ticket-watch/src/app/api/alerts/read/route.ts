import { NextResponse } from "next/server";
import { markAlertEventRead, markAllAlertEventsRead } from "@/lib/data-access/alerts";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (body?.all) {
    markAllAlertEventsRead();
  } else if (typeof body?.id === "string") {
    markAlertEventRead(body.id);
  } else {
    return NextResponse.json({ error: "id or all is required" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
