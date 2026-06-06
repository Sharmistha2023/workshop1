import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const actor = searchParams.get("actor")?.trim();

  if (!actor) {
    return NextResponse.json({ error: "Actor name is required." }, { status: 400 });
  }

  const rows = await sql`
    SELECT f.title, f.year, f.genre, f.rank, a.name AS actor_name
    FROM films f
    JOIN actors a ON a.id = f.actor_id
    WHERE LOWER(a.name) = LOWER(${actor})
    ORDER BY f.rank ASC
    LIMIT 3
  `;

  if (rows.length === 0) {
    return NextResponse.json({ error: `No results found for "${actor}".` }, { status: 404 });
  }

  return NextResponse.json({ actor: rows[0].actor_name, films: rows });
}
