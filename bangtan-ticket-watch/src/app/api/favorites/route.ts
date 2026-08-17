import { NextResponse } from "next/server";
import { addFavorite, getFavorites, removeFavorite } from "@/lib/data-access/favorites";

export async function GET() {
  return NextResponse.json(getFavorites());
}

export async function POST(request: Request) {
  const body = await request.json();
  const listingId = typeof body?.listingId === "string" ? body.listingId : null;
  if (!listingId) return NextResponse.json({ error: "listingId is required" }, { status: 400 });

  const favorite = addFavorite(listingId);
  if (!favorite) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  return NextResponse.json(favorite, { status: 201 });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const listingId = typeof body?.listingId === "string" ? body.listingId : null;
  if (!listingId) return NextResponse.json({ error: "listingId is required" }, { status: 400 });

  const favorites = getFavorites();
  const match = favorites.find((f) => f.favorite.listingId === listingId);
  if (match) removeFavorite(match.favorite.id);
  return NextResponse.json({ ok: true });
}
