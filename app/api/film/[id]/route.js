import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { chat } from "@/lib/llm";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const { id } = params;

  const [film] = await sql`
    SELECT f.*, a.name AS actor_name, a.photo_url AS actor_photo
    FROM films f
    JOIN actors a ON a.id = f.actor_id
    WHERE f.id = ${id}
  `;
  if (!film) return NextResponse.json({ error: "Film not found" }, { status: 404 });

  // Fetch similar films from same actor
  const sameActor = await sql`
    SELECT id, title, year, genre, poster_url
    FROM films
    WHERE actor_id = ${film.actor_id} AND id != ${id}
    ORDER BY rank ASC
  `;

  // LLM-generated insight
  let insight = null;
  try {
    insight = await chat(
      `Give a 2-sentence enthusiastic summary of why "${film.title}" (${film.year}) by ${film.actor_name} is a must-watch film.`,
      { temperature: 0.8, max_tokens: 120 }
    );
  } catch {}

  return NextResponse.json({ ...film, same_actor_films: sameActor, insight });
}
