import { NextResponse } from "next/server";
import { toggleProvider } from "@/lib/data-access/admin";
import type { ProviderId } from "@/types/domain";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const enabled = Boolean(body?.enabled);
  const result = toggleProvider(id as ProviderId, enabled);
  return NextResponse.json({ id, enabled: result });
}
