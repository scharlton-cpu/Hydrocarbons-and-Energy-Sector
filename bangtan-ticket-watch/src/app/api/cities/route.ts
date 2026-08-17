import { NextResponse } from "next/server";
import { addCity, type AddCityInput } from "@/lib/data-access/cities";
import { createWatch } from "@/lib/data-access/watches";
import { createAlertRule } from "@/lib/data-access/alerts";
import type { Currency, SeatZoneCategory } from "@/types/domain";

interface AddCityRequestBody {
  artistName?: string;
  city: string;
  country: string;
  venue: string;
  address?: string;
  timezone?: string;
  dates: string[];
  currency: Currency;
  seatingAreas: { name: string; category: SeatZoneCategory }[];
  targetPrice?: number;
  ticketsNeeded?: number;
  providers?: Array<"tickpick" | "stubhub" | "seatgeek">;
  createAlert?: boolean;
}

export async function POST(request: Request) {
  const body = (await request.json()) as AddCityRequestBody;

  if (!body.city || !body.venue || !body.country || !Array.isArray(body.dates) || body.dates.length === 0) {
    return NextResponse.json({ error: "city, country, venue, and at least one date are required" }, { status: 400 });
  }
  if (!Array.isArray(body.seatingAreas) || body.seatingAreas.length === 0) {
    return NextResponse.json({ error: "at least one seating area is required" }, { status: 400 });
  }

  const input: AddCityInput = {
    artistName: body.artistName,
    city: body.city,
    country: body.country,
    venue: body.venue,
    address: body.address,
    timezone: body.timezone,
    dates: body.dates,
    currency: body.currency || "USD",
    seatingAreas: body.seatingAreas,
    targetPrice: body.targetPrice,
    ticketsNeeded: body.ticketsNeeded,
    providers: body.providers,
  };

  const result = addCity(input);

  if (body.targetPrice !== undefined && body.targetPrice > 0) {
    const watch = createWatch({
      name: `${result.city.name} Watch`,
      cityId: result.city.id,
      concertEventIds: "all",
      seatZoneCategories: Array.from(new Set(body.seatingAreas.map((s) => s.category))),
      quantity: body.ticketsNeeded ?? 1,
      maxPrice: body.targetPrice,
      currency: input.currency,
    });

    if (body.createAlert !== false) {
      createAlertRule({
        watchId: watch.id,
        cityId: result.city.id,
        type: "price_below",
        thresholdPrice: body.targetPrice,
      });
    }
  }

  return NextResponse.json(
    { citySlug: result.city.slug, cityId: result.city.id, eventIds: result.events.map((e) => e.id) },
    { status: 201 }
  );
}
