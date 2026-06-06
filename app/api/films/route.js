import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { chat } from "@/lib/llm";

export const dynamic = "force-dynamic";

function toTitleCase(str) {
  return str.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.substr(1).toLowerCase());
}

async function fetchFromLLM(actorName) {
  const raw = await chat(
    `List the top 3 most acclaimed films of the actor "${actorName}".
Return ONLY valid JSON in this exact format, no markdown, no explanation:
[
  {"title":"Film Title","year":2001,"genre":"Genre"},
  {"title":"Film Title","year":2005,"genre":"Genre"},
  {"title":"Film Title","year":2010,"genre":"Genre"}
]
If this person is not a real actor, return an empty array [].`,
    { temperature: 0.2, max_tokens: 200 }
  );

  const jsonStr = raw.trim().replace(/^```json|^```|```$/gm, "").trim();
  const films = JSON.parse(jsonStr);
  if (!Array.isArray(films) || films.length === 0) return null;
  return films;
}

async function saveToDb(actorName, films) {
  const [actor] = await sql`
    INSERT INTO actors (name)
    VALUES (${toTitleCase(actorName)})
    ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
    RETURNING id, name
  `;
  for (let i = 0; i < films.length; i++) {
    const { title, year, genre } = films[i];
    await sql`
      INSERT INTO films (actor_id, title, year, genre, rank)
      VALUES (${actor.id}, ${title}, ${Number(year) || null}, ${genre}, ${i + 1})
      ON CONFLICT DO NOTHING
    `;
  }
  return actor;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const actor = searchParams.get("actor")?.trim();

  if (!actor) {
    return NextResponse.json({ error: "Actor name is required." }, { status: 400 });
  }

  // 1. Try DB first
  let rows = await sql`
    SELECT f.id, f.title, f.year, f.genre, f.rank, a.name AS actor_name
    FROM films f
    JOIN actors a ON a.id = f.actor_id
    WHERE LOWER(a.name) = LOWER(${actor})
    ORDER BY f.rank ASC
    LIMIT 3
  `;

  // 2. Not in DB — ask LLM and save
  if (rows.length === 0) {
    let films;
    try {
      films = await fetchFromLLM(actor);
    } catch {
      return NextResponse.json({ error: `Could not find films for "${actor}". Try another name.` }, { status: 404 });
    }

    if (!films) {
      return NextResponse.json({ error: `"${toTitleCase(actor)}" doesn't appear to be a known actor.` }, { status: 404 });
    }

    await saveToDb(actor, films);

    // Re-fetch from DB with IDs
    rows = await sql`
      SELECT f.id, f.title, f.year, f.genre, f.rank, a.name AS actor_name
      FROM films f
      JOIN actors a ON a.id = f.actor_id
      WHERE LOWER(a.name) = LOWER(${actor})
      ORDER BY f.rank ASC
      LIMIT 3
    `;
  }

  return NextResponse.json({ actor: rows[0].actor_name, films: rows });
}
