import { NextResponse } from "next/server";
import { updateWatchStatus } from "@/lib/data-access/watches";
import type { WatchStatus } from "@/types/domain";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const status = body?.status as WatchStatus | undefined;
  if (!status) return NextResponse.json({ error: "status is required" }, { status: 400 });

  const watch = updateWatchStatus(id, status);
  if (!watch) return NextResponse.json({ error: "Watch not found" }, { status: 404 });
  return NextResponse.json(watch);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const watch = updateWatchStatus(id, "deleted");
  if (!watch) return NextResponse.json({ error: "Watch not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
