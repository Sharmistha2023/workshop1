import { NextResponse } from "next/server";
import { chat } from "@/lib/llm";

export const dynamic = "force-dynamic";
import sql from "@/lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const actor = searchParams.get("actor")?.trim();

  if (!actor) {
    return NextResponse.json({ error: "Actor name is required." }, { status: 400 });
  }

  const films = await sql`
    SELECT f.title, f.year, f.genre
    FROM films f
    JOIN actors a ON a.id = f.actor_id
    WHERE LOWER(a.name) = LOWER(${actor})
    ORDER BY f.rank ASC
    LIMIT 3
  `;

  if (films.length === 0) {
    return NextResponse.json({ error: "Actor not found in database." }, { status: 404 });
  }

  const filmList = films.map(f => `"${f.title}" (${f.year}, ${f.genre})`).join(", ");

  const recommendation = await chat(
    `Given that someone loves these films by ${actor}: ${filmList} — suggest 3 other films (any actor, any era) they would enjoy. Format as a numbered list with one sentence explanation each.`,
    {
      system: "You are a film expert specialising in world cinema with deep knowledge of Bollywood, Hollywood, and international films. Keep responses concise and enthusiastic.",
      temperature: 0.8,
      max_tokens: 400,
    }
  );

  return NextResponse.json({ actor, based_on: films, recommendation });
}
