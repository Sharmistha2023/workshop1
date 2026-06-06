import { NextResponse } from "next/server";
import sql from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json([]);

  const rows = await sql`
    SELECT a.id, a.name, a.photo_url,
           COUNT(f.id) AS film_count
    FROM actors a
    LEFT JOIN films f ON f.actor_id = a.id
    WHERE a.name ILIKE ${"%" + q + "%"}
    GROUP BY a.id, a.name, a.photo_url
    ORDER BY a.name
    LIMIT 6
  `;
  return NextResponse.json(rows);
}
