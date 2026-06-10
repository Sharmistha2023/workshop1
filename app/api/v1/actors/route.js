import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { createHash } from "crypto";

export const dynamic = "force-dynamic";

async function verifyApiKey(request) {
  const authHeader = request.headers.get("authorization") || "";
  const key = authHeader.replace("Bearer ", "").trim() ||
    new URL(request.url).searchParams.get("api_key");
  if (!key) return null;
  const hash = createHash("sha256").update(key).digest("hex");
  const [row] = await sql`SELECT id, user_id FROM api_keys WHERE key_hash = ${hash}`;
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
  const q     = searchParams.get("q");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

  const actors = q
    ? await sql`
        SELECT a.id, a.name, a.bio, a.photo_url, COUNT(f.id) AS film_count
        FROM actors a LEFT JOIN films f ON f.actor_id = a.id
        WHERE LOWER(a.name) LIKE ${'%' + q.toLowerCase() + '%'}
        GROUP BY a.id ORDER BY film_count DESC LIMIT ${limit}
      `
    : await sql`
        SELECT a.id, a.name, a.bio, a.photo_url, COUNT(f.id) AS film_count
        FROM actors a LEFT JOIN films f ON f.actor_id = a.id
        GROUP BY a.id ORDER BY film_count DESC LIMIT ${limit}
      `;

  return NextResponse.json({ data: actors, count: actors.length });
}
