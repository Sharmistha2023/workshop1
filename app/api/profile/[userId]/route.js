import { NextResponse } from "next/server";
import sql from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const { userId } = params;

  const [user] = await sql`SELECT id, name, image, created_at FROM users WHERE id = ${userId}`;
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const watchlist = await sql`
    SELECT f.id, f.title, f.year, f.genre, f.poster_url, a.name AS actor_name
    FROM watchlist w JOIN films f ON f.id = w.film_id JOIN actors a ON a.id = f.actor_id
    WHERE w.user_id = ${userId} ORDER BY w.added_at DESC LIMIT 12
  `;

  const reviews = await sql`
    SELECT r.rating, r.body, r.created_at, f.title, f.year, f.id AS film_id
    FROM reviews r JOIN films f ON f.id = r.film_id
    WHERE r.user_id = ${userId} ORDER BY r.created_at DESC LIMIT 10
  `;

  const history = await sql`
    SELECT COUNT(*) AS total FROM watch_history WHERE user_id = ${userId}
  `;

  const followers = await sql`SELECT COUNT(*) AS count FROM user_follows WHERE following_id = ${userId}`;
  const following = await sql`SELECT COUNT(*) AS count FROM user_follows WHERE follower_id = ${userId}`;

  return NextResponse.json({
    user,
    watchlist,
    reviews,
    watched_total: Number(history[0].total),
    followers: Number(followers[0].count),
    following: Number(following[0].count),
  });
}
