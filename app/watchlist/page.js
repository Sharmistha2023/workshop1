"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const medals = ["🥇", "🥈", "🥉"];

export default function WatchlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [films, setFilms]   = useState([]);
  const [loading, setLoad]  = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) { setLoad(false); return; }
    fetch("/api/watchlist")
      .then(r => r.json())
      .then(data => { setFilms(Array.isArray(data) ? data : []); setLoad(false); });
  }, [session, status]);

  async function remove(filmId) {
    await fetch("/api/watchlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ film_id: filmId }),
    });
    setFilms(f => f.filter(x => x.id !== filmId));
  }

  if (status === "loading" || loading) return (
    <main className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}>
      <p className="text-white/40 animate-pulse">Loading…</p>
    </main>
  );

  if (!session) return (
    <main className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}>
      <div className="text-center">
        <p className="text-white/50 text-sm mb-4">Sign in to see your watchlist</p>
        <button onClick={() => signIn()}
          className="px-6 py-2 rounded-2xl text-white font-bold text-sm"
          style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
          Sign in
        </button>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen pt-20 pb-12"
      style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}>

      <div className="fixed top-[-80px] left-[-80px] w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #ff6ec7, #7873f5)" }} />

      <div className="relative max-w-2xl mx-auto px-4 z-10">
        <div className="mb-8 text-center">
          <span className="text-4xl">📋</span>
          <h1 className="text-3xl font-black text-white mt-2">My Watchlist</h1>
          <p className="text-white/40 text-sm mt-1">{films.length} film{films.length !== 1 ? "s" : ""} saved</p>
        </div>

        {films.length === 0 ? (
          <div className="text-center rounded-3xl border border-white/10 p-12"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            <p className="text-white/30 text-sm">No films saved yet.</p>
            <button onClick={() => router.push("/")}
              className="mt-4 px-5 py-2 rounded-2xl text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
              Browse Films
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {films.map((film, i) => (
              <div key={film.id} className="rounded-2xl border border-white/10 flex items-center gap-4 px-4 py-3"
                style={{ background: "rgba(255,255,255,0.05)" }}>
                <button onClick={() => router.push(`/film/${film.id}`)}
                  className="flex items-center gap-4 flex-1 text-left">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
                    {medals[film.rank - 1] || "🎬"}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{film.title}</p>
                    <p className="text-white/40 text-xs">{film.actor_name} · {film.year} · {film.genre}</p>
                  </div>
                </button>
                <button onClick={() => remove(film.id)}
                  className="text-white/30 hover:text-red-400 transition text-sm px-2 py-1">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
