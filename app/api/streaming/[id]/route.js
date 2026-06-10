import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getWatchProviders } from "@/lib/tmdb";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const { id } = params;

  const [film] = await sql`SELECT tmdb_id FROM films WHERE id = ${id}`;
  if (!film) return NextResponse.json({ error: "Film not found" }, { status: 404 });
  if (!film.tmdb_id) return NextResponse.json({ providers: null, message: "No TMDB data for this film" });
  if (!process.env.TMDB_API_KEY) return NextResponse.json({ providers: null, message: "TMDB not configured" });

  try {
    const providers = await getWatchProviders(film.tmdb_id);
    return NextResponse.json({ providers });
  } catch (err) {
    return NextResponse.json({ providers: null, error: err.message });
  }
}
