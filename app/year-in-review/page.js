import Link from "next/link";
import sql from "@/lib/db";

export const metadata = {
  title: "Year in Review | Films Finder",
  description: "The best Bollywood and Indian cinema films by year.",
};

export default async function YearInReviewPage() {
  const films = await sql`
    SELECT f.*, a.name AS actor_name,
      COALESCE(ROUND(AVG(r.rating),1), 0) AS avg_stars,
      COALESCE(COUNT(DISTINCT r.id), 0) AS review_count,
      COALESCE(COUNT(DISTINCT w.id), 0) AS save_count
    FROM films f
    JOIN actors a ON a.id = f.actor_id
    LEFT JOIN reviews r ON r.film_id = f.id
    LEFT JOIN watchlist w ON w.film_id = f.id
    GROUP BY f.id, a.name
    ORDER BY f.year DESC, save_count DESC, avg_stars DESC
  `;

  const byYear = {};
  for (const f of films) {
    if (!byYear[f.year]) byYear[f.year] = [];
    byYear[f.year].push(f);
  }
  const years = Object.keys(byYear).sort((a, b) => b - a);

  return (
    <main className="min-h-screen pt-20 pb-16 px-4"
      style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white">📅 Year in Review</h1>
          <p className="text-white/40 mt-2 text-sm">Indian cinema highlights from every decade</p>
        </div>

        {years.map(year => (
          <div key={year} className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl font-black text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(135deg, #f093fb, #f5576c, #ffd200)" }}>
                {year}
              </span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
              <span className="text-white/30 text-xs">{byYear[year].length} films</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {byYear[year].slice(0, 5).map(film => (
                <Link key={film.id} href={`/film/${film.id}`}
                  className="flex items-center gap-4 rounded-2xl p-3 border border-white/10 hover:border-purple-500/30 hover:scale-[1.01] transition-all"
                  style={{ background: "rgba(255,255,255,0.04)" }}>
                  {film.poster_url ? (
                    <img src={film.poster_url} alt={film.title}
                      className="w-10 h-14 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-14 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>🎬</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate">{film.title}</p>
                    <p className="text-white/40 text-xs">{film.actor_name}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-white/30">
                      <span className="rounded-full px-2 py-0.5"
                        style={{ background: "rgba(255,255,255,0.08)" }}>{film.genre}</span>
                      {Number(film.avg_stars) > 0 && <span className="text-yellow-400">★ {film.avg_stars}</span>}
                      {Number(film.save_count) > 0 && <span>📋 {film.save_count}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-6 text-center">
          <Link href="/trending" className="text-purple-400 text-sm hover:text-purple-300 transition">
            ← Back to Trending
          </Link>
        </div>
      </div>
    </main>
  );
}
