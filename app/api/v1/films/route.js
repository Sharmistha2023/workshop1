import { NextResponse } from "next/server";
import sql from "@/lib/db";

export const dynamic = "force-dynamic";

async function verifyApiKey(request) {
  const authHeader = request.headers.get("authorization") || "";
  const key = authHeader.replace("Bearer ", "").trim() ||
    new URL(request.url).searchParams.get("api_key");
  if (!key) return null;

  const prefix = key.substring(0, 8);
  const { createHash } = await import("crypto");
  const hash = createHash("sha256").update(key).digest("hex");

  const [row] = await sql`
    SELECT id, user_id FROM api_keys WHERE key_hash = ${hash}
  `;
  if (row) {
    await sql`UPDATE api_keys SET last_used_at = now() WHERE id = ${row.id}`;
    return row.user_id;
  }
  return null;
}

export async function GET(request) {
  const userId = await verifyApiKey(request);
  if (!userId) {
    return NextResponse.json(
      { error: "Invalid or missing API key. Get one at /profile." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const actor = searchParams.get("actor");
  const lang  = searchParams.get("language");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

  let films;
  if (actor) {
    films = await sql`
      SELECT f.id, f.title, f.year, f.genre, f.language, f.rating, f.overview, f.poster_url,
        a.name AS actor
      FROM films f JOIN actors a ON a.id = f.actor_id
      WHERE LOWER(a.name) LIKE ${'%' + actor.toLowerCase() + '%'}
      ORDER BY f.rank ASC LIMIT ${limit}
    `;
  } else if (lang) {
    films = await sql`
      SELECT f.id, f.title, f.year, f.genre, f.language, f.rating, f.overview, f.poster_url,
        a.name AS actor
      FROM films f JOIN actors a ON a.id = f.actor_id
      WHERE f.language = ${lang}
      ORDER BY f.rank ASC LIMIT ${limit}
    `;
  } else {
    films = await sql`
      SELECT f.id, f.title, f.year, f.genre, f.language, f.rating, f.overview, f.poster_url,
        a.name AS actor
      FROM films f JOIN actors a ON a.id = f.actor_id
      ORDER BY f.id ASC LIMIT ${limit}
    `;
  }

  return NextResponse.json({ data: films, count: films.length });
}
