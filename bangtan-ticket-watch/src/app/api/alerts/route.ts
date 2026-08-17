import { NextResponse } from "next/server";
import { createAlertRule, getAlertRules } from "@/lib/data-access/alerts";
import type { AlertRuleType, SeatZoneCategory } from "@/types/domain";

export async function GET() {
  return NextResponse.json(getAlertRules());
}

export async function POST(request: Request) {
  const body = await request.json();
  const { type, cityId, seatZoneCategory, thresholdPrice, thresholdPercent } = body as {
    type?: AlertRuleType;
    cityId?: string;
    seatZoneCategory?: SeatZoneCategory;
    thresholdPrice?: number;
    thresholdPercent?: number;
  };

  if (!type) return NextResponse.json({ error: "type is required" }, { status: 400 });

  const rule = createAlertRule({ type, cityId, seatZoneCategory, thresholdPrice, thresholdPercent });
  return NextResponse.json(rule, { status: 201 });
}
