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
    `A user loves these films by ${actor}: ${filmList}.

Recommend exactly 3 films from OTHER actors and directors that match these films' themes and tone.
Do NOT recommend any film by ${actor} or any of the films already listed above.

Output only the 3 recommendations — no preamble, no self-correction, no commentary. Use this exact format:
1. **Film Title** (Year) — one sentence on why it matches their taste.
2. **Film Title** (Year) — one sentence on why it matches their taste.
3. **Film Title** (Year) — one sentence on why it matches their taste.`,
    {
      system: "You are a world cinema curator. Output ONLY the numbered list — no thinking aloud, no corrections, no extra text before or after.",
      temperature: 0.3,
      max_tokens: 350,
    }
  );

  return NextResponse.json({ actor, based_on: films, recommendation });
}
