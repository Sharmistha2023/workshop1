import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const reviews = await sql`
    SELECT 'review' AS type, r.created_at AS at,
           u.id AS user_id, u.name AS user_name, u.image AS user_image,
           f.id AS film_id, f.title AS film_title, f.year,
           r.rating, r.body
    FROM reviews r
    JOIN users u ON u.id = r.user_id
    JOIN films f ON f.id = r.film_id
    WHERE r.user_id IN (
      SELECT following_id FROM user_follows WHERE follower_id = ${session.user.id}
    )
    ORDER BY r.created_at DESC
    LIMIT 20
  `;

  const watched = await sql`
    SELECT 'watched' AS type, h.watched_at AS at,
           u.id AS user_id, u.name AS user_name, u.image AS user_image,
           f.id AS film_id, f.title AS film_title, f.year, NULL AS rating, NULL AS body
    FROM watch_history h
    JOIN users u ON u.id = h.user_id
    JOIN films f ON f.id = h.film_id
    WHERE h.user_id IN (
      SELECT following_id FROM user_follows WHERE follower_id = ${session.user.id}
    )
    ORDER BY h.watched_at DESC
    LIMIT 20
  `;

  const feed = [...reviews, ...watched].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 30);
  return NextResponse.json(feed);
}
