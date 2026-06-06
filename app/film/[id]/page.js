"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

const medals = ["🥇", "🥈", "🥉"];

export default function FilmPage() {
  const { id } = useParams();
  const router = useRouter();
  const [film, setFilm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/film/${id}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setFilm(d); setLoading(false); })
      .catch(() => { setError("Failed to load film."); setLoading(false); });
  }, [id]);

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center pt-16"
      style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}>
      <p className="text-white/40 animate-pulse">Loading film…</p>
    </main>
  );

  if (error) return (
    <main className="min-h-screen flex items-center justify-center pt-16"
      style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}>
      <p className="text-red-400">{error}</p>
    </main>
  );

  return (
    <main className="min-h-screen pt-20 pb-12"
      style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}>

      {/* Blob */}
      <div className="fixed top-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #f093fb, #f5576c)" }} />

      <div className="relative max-w-2xl mx-auto px-4 z-10">

        {/* Back */}
        <button onClick={() => router.back()}
          className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition">
          ← Back
        </button>

        {/* Hero */}
        <div className="rounded-3xl border border-white/10 overflow-hidden mb-6"
          style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)" }}>

          <div className="flex gap-5 p-6">
            {/* Poster */}
            <div className="w-28 h-40 rounded-2xl flex-shrink-0 flex items-center justify-center text-5xl"
              style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
              {film.poster_url
                ? <Image src={film.poster_url} alt={film.title} width={112} height={160} className="rounded-2xl object-cover w-full h-full" />
                : "🎬"}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <h1 className="text-2xl font-black text-white leading-tight">{film.title}</h1>
                {film.rank && <span className="text-2xl flex-shrink-0">{medals[film.rank - 1] || ""}</span>}
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs font-semibold rounded-full px-3 py-1"
                  style={{ background: "rgba(168,85,247,0.2)", color: "#c084fc" }}>{film.genre}</span>
                <span className="text-xs font-semibold rounded-full px-3 py-1"
                  style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>{film.year}</span>
                {film.rating && (
                  <span className="text-xs font-semibold rounded-full px-3 py-1"
                    style={{ background: "rgba(245,158,11,0.2)", color: "#fbbf24" }}>⭐ {film.rating}</span>
                )}
              </div>

              <p className="text-white/50 text-sm mt-2">
                Actor: <span className="text-purple-300 font-semibold">{film.actor_name}</span>
              </p>

              {film.overview && (
                <p className="text-white/60 text-sm mt-3 leading-relaxed">{film.overview}</p>
              )}
            </div>
          </div>

          {/* AI Insight */}
          {film.insight && (
            <div className="mx-6 mb-6 rounded-2xl px-4 py-3 border border-purple-500/20"
              style={{ background: "rgba(168,85,247,0.08)" }}>
              <p className="text-xs text-purple-400 font-semibold uppercase tracking-widest mb-1">AI Insight</p>
              <p className="text-white/70 text-sm leading-relaxed">{film.insight}</p>
            </div>
          )}
        </div>

        {/* More films by same actor */}
        {film.same_actor_films?.length > 0 && (
          <div>
            <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-3">
              More by {film.actor_name}
            </p>
            <div className="space-y-2">
              {film.same_actor_films.map((f) => (
                <button key={f.id} onClick={() => router.push(`/film/${f.id}`)}
                  className="w-full text-left rounded-2xl px-4 py-3 border border-white/10 hover:border-purple-500/40 hover:bg-white/5 transition flex items-center gap-3"
                  style={{ background: "rgba(255,255,255,0.04)" }}>
                  <span className="text-xl">{medals[f.rank - 1] || "🎬"}</span>
                  <div>
                    <p className="text-white font-semibold text-sm">{f.title}</p>
                    <p className="text-white/40 text-xs">{f.genre} · {f.year}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
