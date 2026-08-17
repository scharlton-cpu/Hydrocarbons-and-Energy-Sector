import { NextResponse } from "next/server";
import { setAlertRuleActive, deleteAlertRule } from "@/lib/data-access/alerts";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const active = Boolean(body?.active);
  const rule = setAlertRuleActive(id, active);
  if (!rule) return NextResponse.json({ error: "Rule not found" }, { status: 404 });
  return NextResponse.json(rule);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  deleteAlertRule(id);
  return NextResponse.json({ ok: true });
}
