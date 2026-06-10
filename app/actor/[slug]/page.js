import { notFound } from "next/navigation";
import Link from "next/link";
import sql from "@/lib/db";

function toSlug(name) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export async function generateStaticParams() {
  const actors = await sql`SELECT name FROM actors`;
  return actors.map((a) => ({ slug: toSlug(a.name) }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const actors = await sql`SELECT * FROM actors`;
  const actor = actors.find((a) => toSlug(a.name) === slug);
  if (!actor) return { title: "Actor Not Found" };
  return {
    title: `${actor.name} — Top Films | Films Finder`,
    description:
      actor.bio ||
      `Discover the best films of ${actor.name} on Films Finder.`,
    openGraph: {
      title: `${actor.name} — Films Finder`,
      description: actor.bio || `Top films of ${actor.name}`,
      images: actor.photo_url ? [{ url: actor.photo_url }] : [],
    },
  };
}

export default async function ActorPage({ params }) {
  const { slug } = await params;
  const actors = await sql`SELECT * FROM actors`;
  const actor = actors.find((a) => toSlug(a.name) === slug);
  if (!actor) notFound();

  const films = await sql`
    SELECT f.*,
      COALESCE(COUNT(DISTINCT w.id),0) AS watchlist_count,
      COALESCE(ROUND(AVG(r.rating),1),0) AS avg_rating,
      COALESCE(COUNT(DISTINCT r.id), 0) AS review_count
    FROM films f
    LEFT JOIN watchlist w ON w.film_id = f.id
    LEFT JOIN reviews r ON r.film_id = f.id
    WHERE f.actor_id = ${actor.id}
    GROUP BY f.id
    ORDER BY f.rank ASC
  `;

  const totalWatched = await sql`
    SELECT COUNT(*) AS c FROM watch_history wh
    JOIN films f ON f.id = wh.film_id
    WHERE f.actor_id = ${actor.id}
  `;

  return (
    <main
      className="min-h-screen pt-20 pb-16 px-4"
      style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Actor Hero */}
        <div className="rounded-3xl p-8 mb-8 border border-white/10 flex gap-6 items-start"
          style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)" }}>
          {actor.photo_url ? (
            <img
              src={actor.photo_url}
              alt={actor.name}
              className="w-24 h-24 rounded-2xl object-cover flex-shrink-0 shadow-xl"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0 shadow-xl"
              style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
              🎭
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-black text-white mb-1">{actor.name}</h1>
            <p className="text-white/50 text-sm leading-relaxed">
              {actor.bio || "One of India's celebrated film actors."}
            </p>
            <div className="flex gap-4 mt-3 text-xs text-white/40 font-semibold">
              <span>{films.length} films</span>
              <span>{Number(totalWatched[0]?.c || 0)} watches</span>
            </div>
          </div>
        </div>

        {/* Films grid */}
        <h2 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4">Filmography</h2>
        <div className="space-y-3">
          {films.map((film, i) => (
            <Link key={film.id} href={`/film/${film.id}`}
              className="flex items-center gap-4 rounded-2xl p-4 border border-white/10 hover:border-purple-500/40 hover:scale-[1.01] transition-all"
              style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(10px)" }}>
              {film.poster_url ? (
                <img src={film.poster_url} alt={film.title}
                  className="w-12 h-16 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-12 h-16 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #f093fb, #f5576c)" }}>
                  🎬
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold truncate">{film.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-white/40">{film.year}</span>
                  <span className="text-xs rounded-full px-2 py-0.5"
                    style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.55)" }}>
                    {film.genre}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-white/30">
                  {Number(film.avg_rating) > 0 && <span>★ {film.avg_rating}</span>}
                  {Number(film.watchlist_count) > 0 && <span>📋 {film.watchlist_count} saves</span>}
                  {Number(film.review_count) > 0 && <span>💬 {film.review_count} reviews</span>}
                </div>
              </div>
              <span className="text-white/20 text-sm">→</span>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-purple-400 text-sm hover:text-purple-300 transition">
            ← Back to search
          </Link>
        </div>
      </div>
    </main>
  );
}
