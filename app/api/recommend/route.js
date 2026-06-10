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

  const themeLines = films
    .map(f => `- ${f.genre}: "${f.title}" (${f.year})`)
    .join("\n");

  const recommendation = await chat(
    `I enjoy films with these genres and tones:\n${themeLines}\n\nRecommend 3 films by DIFFERENT directors from diverse industries (Hollywood, European, Asian, independent Bollywood) that share these themes. Do not recommend any of the films listed above.\n\nRespond with exactly 3 lines:\n1. **Title** (Year) — one sentence why it fits.\n2. **Title** (Year) — one sentence why it fits.\n3. **Title** (Year) — one sentence why it fits.`,
    {
      system: "You are a world cinema curator. Output ONLY the 3 numbered recommendations — no intro, no caveats, no corrections. Start directly with '1.'",
      temperature: 0.4,
      max_tokens: 300,
    }
  );

  return NextResponse.json({ actor, based_on: films, recommendation });
}
