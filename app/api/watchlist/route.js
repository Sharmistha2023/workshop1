import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await sql`
    SELECT f.id, f.title, f.year, f.genre, f.poster_url, f.rank,
           a.name AS actor_name, w.added_at
    FROM watchlist w
    JOIN films f ON f.id = w.film_id
    JOIN actors a ON a.id = f.actor_id
    WHERE w.user_id = ${session.user.id}
    ORDER BY w.added_at DESC
  `;
  return NextResponse.json(rows);
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { film_id } = await request.json();
  if (!film_id) return NextResponse.json({ error: "film_id required" }, { status: 400 });

  await sql`
    INSERT INTO watchlist (user_id, film_id)
    VALUES (${session.user.id}, ${film_id})
    ON CONFLICT DO NOTHING
  `;
  return NextResponse.json({ ok: true });
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { film_id } = await request.json();
  await sql`
    DELETE FROM watchlist WHERE user_id = ${session.user.id} AND film_id = ${film_id}
  `;
  return NextResponse.json({ ok: true });
}
