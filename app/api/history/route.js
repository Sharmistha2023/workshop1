import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";

export const dynamic = "force-dynamic";

function calcStreak(dates) {
  if (!dates.length) return 0;
  const sorted = [...new Set(dates.map(d => d.toISOString().slice(0, 10)))].sort().reverse();
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = (prev - curr) / (1000 * 60 * 60 * 24);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await sql`
    SELECT f.id, f.title, f.year, f.genre, f.poster_url, a.name AS actor_name, h.watched_at
    FROM watch_history h
    JOIN films f ON f.id = h.film_id
    JOIN actors a ON a.id = f.actor_id
    WHERE h.user_id = ${session.user.id}
    ORDER BY h.watched_at DESC
  `;

  const streak = calcStreak(rows.map(r => new Date(r.watched_at)));
  return NextResponse.json({ films: rows, streak });
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { film_id } = await request.json();
  if (!film_id) return NextResponse.json({ error: "film_id required" }, { status: 400 });

  await sql`
    INSERT INTO watch_history (user_id, film_id)
    VALUES (${session.user.id}, ${film_id})
    ON CONFLICT DO NOTHING
  `;
  return NextResponse.json({ ok: true });
}
