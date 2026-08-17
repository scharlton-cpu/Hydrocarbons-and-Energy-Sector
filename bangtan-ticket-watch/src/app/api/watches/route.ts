import { NextResponse } from "next/server";
import { createWatch, getWatches } from "@/lib/data-access/watches";
import type { Currency, SeatZoneCategory } from "@/types/domain";

export async function GET() {
  return NextResponse.json(getWatches());
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, cityId, seatZoneCategories, quantity, maxPrice, currency } = body as {
    name?: string;
    cityId?: string;
    seatZoneCategories?: SeatZoneCategory[];
    quantity?: number;
    maxPrice?: number;
    currency?: Currency;
  };

  if (!name || !cityId || !seatZoneCategories?.length || !maxPrice || !currency) {
    return NextResponse.json({ error: "name, cityId, seatZoneCategories, maxPrice, and currency are required" }, { status: 400 });
  }

  const watch = createWatch({
    name,
    cityId,
    concertEventIds: "all",
    seatZoneCategories,
    quantity: quantity ?? 1,
    maxPrice,
    currency,
  });

  return NextResponse.json(watch, { status: 201 });
}
