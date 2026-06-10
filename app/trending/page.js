import Link from "next/link";
import sql from "@/lib/db";

export const metadata = {
  title: "Trending Films | Films Finder",
  description: "Most watched and highest rated films right now on Films Finder.",
};

export const dynamic = "force-dynamic";

export default async function TrendingPage() {
  const [topWatchlisted, topRated, mostWatched, recentActivity] = await Promise.all([
    sql`
      SELECT f.*, a.name AS actor_name, COUNT(w.id) AS save_count
      FROM films f
      JOIN actors a ON a.id = f.actor_id
      LEFT JOIN watchlist w ON w.film_id = f.id
      GROUP BY f.id, a.name
      ORDER BY save_count DESC, f.rank ASC
      LIMIT 10
    `,
    sql`
      SELECT f.*, a.name AS actor_name,
        ROUND(AVG(r.rating),1) AS avg_stars, COUNT(r.id) AS review_count
      FROM films f
      JOIN actors a ON a.id = f.actor_id
      JOIN reviews r ON r.film_id = f.id
      GROUP BY f.id, a.name
      HAVING COUNT(r.id) >= 1
      ORDER BY ROUND(AVG(r.rating),1) DESC, COUNT(r.id) DESC
      LIMIT 10
    `,
    sql`
      SELECT f.*, a.name AS actor_name, COUNT(wh.id) AS watch_count
      FROM films f
      JOIN actors a ON a.id = f.actor_id
      LEFT JOIN watch_history wh ON wh.film_id = f.id
      GROUP BY f.id, a.name
      ORDER BY watch_count DESC
      LIMIT 10
    `,
    sql`
      SELECT f.title, f.id, a.name AS actor_name, r.rating AS stars, r.body AS review_text,
        u.name AS user_name, r.created_at
      FROM reviews r
      JOIN films f ON f.id = r.film_id
      JOIN actors a ON a.id = f.actor_id
      JOIN users u ON u.id = r.user_id
      ORDER BY r.created_at DESC
      LIMIT 5
    `,
  ]);

  function FilmCard({ film, badge }) {
    return (
      <Link href={`/film/${film.id}`}
        className="flex items-center gap-3 rounded-2xl p-3 border border-white/10 hover:border-purple-500/30 hover:scale-[1.01] transition-all"
        style={{ background: "rgba(255,255,255,0.04)" }}>
        {film.poster_url ? (
          <img src={film.poster_url} alt={film.title}
            className="w-10 h-14 rounded-lg object-cover flex-shrink-0" />
        ) : (
          <div className="w-10 h-14 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #f093fb, #f5576c)" }}>🎬</div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-bold truncate">{film.title}</p>
          <p className="text-white/40 text-xs">{film.actor_name} · {film.year}</p>
          {badge}
        </div>
      </Link>
    );
  }

  return (
    <main className="min-h-screen pt-20 pb-16 px-4"
      style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white">🔥 Trending Now</h1>
          <p className="text-white/40 mt-2 text-sm">Most saved, reviewed and watched films on Films Finder</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Most Watchlisted */}
          <div>
            <h2 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">
              📋 Most Saved to Watchlist
            </h2>
            <div className="space-y-2">
              {topWatchlisted.map(f => (
                <FilmCard key={f.id} film={f}
                  badge={<p className="text-purple-400 text-xs mt-0.5">📋 {f.save_count} saves</p>} />
              ))}
              {topWatchlisted.length === 0 && <p className="text-white/30 text-sm">No data yet.</p>}
            </div>
          </div>

          {/* Top Rated */}
          <div>
            <h2 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">
              ⭐ Highest Rated
            </h2>
            <div className="space-y-2">
              {topRated.map(f => (
                <FilmCard key={f.id} film={f}
                  badge={<p className="text-yellow-400 text-xs mt-0.5">★ {f.avg_stars} ({f.review_count} reviews)</p>} />
              ))}
              {topRated.length === 0 && <p className="text-white/30 text-sm">No reviews yet.</p>}
            </div>
          </div>

          {/* Most Watched */}
          <div>
            <h2 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">
              👁 Most Watched
            </h2>
            <div className="space-y-2">
              {mostWatched.map(f => (
                <FilmCard key={f.id} film={f}
                  badge={<p className="text-green-400 text-xs mt-0.5">👁 {f.watch_count} views</p>} />
              ))}
              {mostWatched.length === 0 && <p className="text-white/30 text-sm">No watches yet.</p>}
            </div>
          </div>

          {/* Recent Reviews */}
          <div>
            <h2 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">
              💬 Recent Reviews
            </h2>
            <div className="space-y-2">
              {recentActivity.map(r => (
                <div key={`${r.id}-${r.created_at}`}
                  className="rounded-2xl p-3 border border-white/10"
                  style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div className="flex items-center justify-between mb-1">
                    <Link href={`/film/${r.id}`}
                      className="text-white text-sm font-bold hover:text-purple-300 transition truncate">
                      {r.title}
                    </Link>
                    <span className="text-yellow-400 text-xs flex-shrink-0 ml-2">
                      {"★".repeat(r.stars)}
                    </span>
                  </div>
                  {r.review_text && (
                    <p className="text-white/50 text-xs line-clamp-2">{r.review_text}</p>
                  )}
                  <p className="text-white/25 text-xs mt-1">by {r.user_name}</p>
                </div>
              ))}
              {recentActivity.length === 0 && <p className="text-white/30 text-sm">No reviews yet.</p>}
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link href="/year-in-review"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold text-sm"
            style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
            📅 View Year-in-Review →
          </Link>
        </div>
      </div>
    </main>
  );
}
