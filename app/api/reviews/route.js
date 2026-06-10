import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const film_id = searchParams.get("film_id");
  if (!film_id) return NextResponse.json({ error: "film_id required" }, { status: 400 });

  const rows = await sql`
    SELECT r.id, r.rating, r.body, r.created_at, u.name AS user_name, u.image AS user_image
    FROM reviews r
    JOIN users u ON u.id = r.user_id
    WHERE r.film_id = ${film_id}
    ORDER BY r.created_at DESC
  `;
  return NextResponse.json(rows);
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { film_id, rating, body } = await request.json();
  if (!film_id || !rating) return NextResponse.json({ error: "film_id and rating required" }, { status: 400 });

  await sql`
    INSERT INTO reviews (user_id, film_id, rating, body)
    VALUES (${session.user.id}, ${film_id}, ${rating}, ${body || null})
    ON CONFLICT (user_id, film_id) DO UPDATE
      SET rating = EXCLUDED.rating, body = EXCLUDED.body, created_at = NOW()
  `;
  return NextResponse.json({ ok: true });
}
