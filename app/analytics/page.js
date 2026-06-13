import sql from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Analytics | Films Finder",
  description: "User engagement metrics for Films Finder.",
};

export default async function AnalyticsPage() {
  const [totals, topFilms, topActors, dailyWatches, activeUsers, langBreakdown] = await Promise.all([
    sql`
      SELECT
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM films) AS total_films,
        (SELECT COUNT(*) FROM actors) AS total_actors,
        (SELECT COUNT(*) FROM watchlist) AS total_saves,
        (SELECT COUNT(*) FROM reviews) AS total_reviews,
        (SELECT COUNT(*) FROM watch_history) AS total_watches
    `,
    sql`
      SELECT f.title, a.name AS actor, f.language,
        COUNT(DISTINCT w.id) AS saves,
        COUNT(DISTINCT r.id) AS reviews,
        ROUND(AVG(r.rating),1) AS avg_stars,
        COUNT(DISTINCT wh.id) AS watches
      FROM films f
      JOIN actors a ON a.id = f.actor_id
      LEFT JOIN watchlist w ON w.film_id = f.id
      LEFT JOIN reviews r ON r.film_id = f.id
      LEFT JOIN watch_history wh ON wh.film_id = f.id
      GROUP BY f.id, a.name
      ORDER BY (COUNT(DISTINCT w.id) + COUNT(DISTINCT wh.id)) DESC
      LIMIT 10
    `,
    sql`
      SELECT a.name,
        COUNT(DISTINCT w.id) AS total_saves,
        COUNT(DISTINCT wh.id) AS total_watches
      FROM actors a
      JOIN films f ON f.actor_id = a.id
      LEFT JOIN watchlist w ON w.film_id = f.id
      LEFT JOIN watch_history wh ON wh.film_id = f.id
      GROUP BY a.id
      ORDER BY COUNT(DISTINCT w.id) + COUNT(DISTINCT wh.id) DESC
      LIMIT 8
    `,
    sql`
      SELECT DATE(watched_at) AS day, COUNT(*) AS cnt
      FROM watch_history
      WHERE watched_at >= NOW() - INTERVAL '30 days'
      GROUP BY day ORDER BY day DESC
    `,
    sql`
      SELECT u.name, u.email,
        COUNT(DISTINCT w.id) AS saves,
        COUNT(DISTINCT r.id) AS reviews,
        COUNT(DISTINCT wh.id) AS watches
      FROM users u
      LEFT JOIN watchlist w ON w.user_id = u.id
      LEFT JOIN reviews r ON r.user_id = u.id
      LEFT JOIN watch_history wh ON wh.user_id = u.id
      GROUP BY u.id
      ORDER BY COUNT(DISTINCT w.id) + COUNT(DISTINCT r.id) + COUNT(DISTINCT wh.id) DESC
      LIMIT 10
    `,
    sql`
      SELECT language, COUNT(*) AS film_count
      FROM films GROUP BY language ORDER BY film_count DESC
    `,
  ]);

  const t = totals[0];

  const stats = [
    { label: "Total Users",   value: t.total_users,   icon: "👤" },
    { label: "Films",         value: t.total_films,    icon: "🎬" },
    { label: "Actors",        value: t.total_actors,   icon: "🎭" },
    { label: "Watchlist Saves", value: t.total_saves,  icon: "📋" },
    { label: "Reviews",       value: t.total_reviews,  icon: "⭐" },
    { label: "Total Watches", value: t.total_watches,  icon: "👁" },
  ];

  return (
    <main className="min-h-screen pt-20 pb-16 px-4"
      style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white">📊 Analytics Dashboard</h1>
          <p className="text-white/40 mt-2 text-sm">User engagement metrics</p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {stats.map(s => (
            <div key={s.label} className="rounded-2xl p-5 border border-white/10 text-center"
              style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="text-3xl mb-1">{s.icon}</div>
              <div className="text-3xl font-black text-white">{s.value}</div>
              <div className="text-white/40 text-xs mt-1 font-semibold uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Language breakdown */}
          <div>
            <h2 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">Films by Language</h2>
            <div className="rounded-2xl border border-white/10 overflow-hidden"
              style={{ background: "rgba(255,255,255,0.04)" }}>
              {langBreakdown.map((l, i) => (
                <div key={l.language}
                  className={`flex items-center justify-between px-4 py-3 ${i < langBreakdown.length - 1 ? "border-b border-white/5" : ""}`}>
                  <span className="text-white text-sm">{l.language}</span>
                  <div className="flex items-center gap-3">
                    <div className="h-2 rounded-full"
                      style={{
                        width: `${Math.round(Number(l.film_count) / Number(t.total_films) * 100)}px`,
                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                        minWidth: "4px",
                      }} />
                    <span className="text-white/50 text-xs w-12 text-right">{l.film_count} films</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top actors */}
          <div>
            <h2 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">Top Actors by Engagement</h2>
            <div className="rounded-2xl border border-white/10 overflow-hidden"
              style={{ background: "rgba(255,255,255,0.04)" }}>
              {topActors.map((a, i) => (
                <div key={a.name}
                  className={`flex items-center justify-between px-4 py-3 ${i < topActors.length - 1 ? "border-b border-white/5" : ""}`}>
                  <span className="text-white text-sm font-medium">{a.name}</span>
                  <div className="flex gap-3 text-xs text-white/40">
                    <span>📋 {a.total_saves}</span>
                    <span>👁 {a.total_watches}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top films */}
        <div className="mb-8">
          <h2 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">Top Films by Engagement</h2>
          <div className="rounded-2xl border border-white/10 overflow-hidden"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            <div className="grid grid-cols-5 px-4 py-2 border-b border-white/10 text-xs text-white/30 font-bold uppercase">
              <span className="col-span-2">Film</span>
              <span className="text-center">Saves</span>
              <span className="text-center">Watches</span>
              <span className="text-center">Rating</span>
            </div>
            {topFilms.map((f, i) => (
              <div key={`${f.title}-${i}`}
                className={`grid grid-cols-5 px-4 py-3 items-center ${i < topFilms.length - 1 ? "border-b border-white/5" : ""}`}>
                <div className="col-span-2">
                  <p className="text-white text-sm font-medium truncate">{f.title}</p>
                  <p className="text-white/30 text-xs truncate">{f.actor} · {f.language}</p>
                </div>
                <span className="text-center text-white/60 text-sm">{f.saves}</span>
                <span className="text-center text-white/60 text-sm">{f.watches}</span>
                <span className="text-center text-yellow-400 text-sm">
                  {Number(f.avg_stars) > 0 ? `★ ${f.avg_stars}` : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Active users */}
        <div>
          <h2 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">Most Active Users</h2>
          <div className="rounded-2xl border border-white/10 overflow-hidden"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            {activeUsers.map((u, i) => (
              <div key={u.email}
                className={`flex items-center justify-between px-4 py-3 ${i < activeUsers.length - 1 ? "border-b border-white/5" : ""}`}>
                <div>
                  <p className="text-white text-sm font-medium">{u.name}</p>
                  <p className="text-white/30 text-xs">{u.email}</p>
                </div>
                <div className="flex gap-4 text-xs text-white/50">
                  <span>📋 {u.saves}</span>
                  <span>⭐ {u.reviews}</span>
                  <span>👁 {u.watches}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {dailyWatches.length > 0 && (
          <div className="mt-8">
            <h2 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">Daily Watch Activity (Last 30 Days)</h2>
            <div className="rounded-2xl border border-white/10 p-4 flex flex-wrap gap-2"
              style={{ background: "rgba(255,255,255,0.04)" }}>
              {dailyWatches.map(d => (
                <div key={String(d.day)} className="text-center">
                  <div className="rounded-lg text-xs px-2 py-1 font-bold"
                    style={{
                      background: `rgba(102,126,234,${Math.min(0.9, 0.15 + Number(d.cnt) * 0.15)})`,
                      color: "rgba(255,255,255,0.8)",
                    }}>
                    {d.cnt}
                  </div>
                  <p className="text-white/20 text-xs mt-0.5">{String(d.day).slice(5)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
