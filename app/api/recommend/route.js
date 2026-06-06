import { NextResponse } from "next/server";
import { chat } from "@/lib/llm";
import sql from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const actor = searchParams.get("actor")?.trim();

  if (!actor) {
    return NextResponse.json({ error: "Actor name is required." }, { status: 400 });
  }

  // Get all actor names already in DB so LLM avoids repeating them
  const allActors = await sql`SELECT name FROM actors ORDER BY name`;
  const knownActors = allActors.map(a => a.name).join(", ");

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
    `A user's favourite films by ${actor} are: ${filmList}.

Based on those specific films' themes, tone, and genre — recommend exactly 3 films they would love.

STRICT RULES:
- Do NOT recommend any film by ${actor}
- Do NOT recommend films already listed: ${filmList}
- Do NOT recommend films by these actors (already in their library): ${knownActors}
- Pick films from DIFFERENT actors, different eras, different languages (Hollywood, world cinema, other Bollywood directors)
- Base your picks on the SPECIFIC themes/tone of the listed films, not just "popular Bollywood films"

Format each as:
1. **Film Title** (Year) — one sentence explaining why it matches their taste.`,
    {
      system: "You are a world cinema curator. You give highly personalised, specific recommendations based on film themes and tone — never generic top-lists. You strictly follow all rules given.",
      temperature: 0.7,
      max_tokens: 450,
    }
  );

  return NextResponse.json({ actor, based_on: films, recommendation });
}
