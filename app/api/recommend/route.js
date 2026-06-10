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

  const themes = films.map(f => `${f.title} (${f.genre})`).join(", ");

  const recommendation = await chat(
    [
      {
        role: "user",
        content: `These are the themes and genres I enjoy: ${themes}. The actor is ${actor}.`,
      },
      {
        role: "assistant",
        content: `Understood. I will recommend 3 films that match those themes. I will only suggest films by directors and actors other than ${actor}, and I will not repeat any of the films you already listed. Here are my 3 recommendations:`,
      },
      {
        role: "user",
        content: `Yes — give me exactly those 3 recommendations now. Each on its own numbered line in this format:\n1. **Title** (Year) — one sentence why it fits.\n2. **Title** (Year) — one sentence why it fits.\n3. **Title** (Year) — one sentence why it fits.`,
      },
    ],
    {
      system: "You are a world cinema curator. Recommend films from diverse directors and industries (Hollywood, European, Asian, independent). Never recommend films by the actor the user already knows.",
      temperature: 0.4,
      max_tokens: 350,
    }
  );

  return NextResponse.json({ actor, based_on: films, recommendation });
}
