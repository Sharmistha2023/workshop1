"use client";

import { useState } from "react";

const suggestions = [
  { name: "Aamir Khan", color: "from-orange-500 to-pink-500" },
  { name: "Shah Rukh Khan", color: "from-blue-500 to-cyan-400" },
  { name: "Amitabh Bachchan", color: "from-yellow-500 to-orange-500" },
  { name: "Salman Khan", color: "from-green-500 to-teal-400" },
  { name: "Hrithik Roshan", color: "from-purple-500 to-pink-500" },
];

const medalColors = [
  { bg: "from-yellow-400 to-amber-500" },
  { bg: "from-slate-300 to-slate-400" },
  { bg: "from-orange-400 to-amber-600" },
];

const medals = ["🥇", "🥈", "🥉"];

export default function Home() {
  const [actor, setActor] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function search(name) {
    const query = (name ?? actor).trim();
    if (!query) {
      setError("Please enter an actor name.");
      setResult(null);
      return;
    }
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch(`/api/films?actor=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Failed to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSuggestion(name) {
    setActor(name);
    search(name);
  }

  return (
    <main
      className="min-h-screen relative overflow-hidden flex items-center justify-center p-6"
      style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}
    >
      {/* Decorative blobs */}
      <div className="absolute top-[-80px] left-[-80px] w-80 h-80 rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, #ff6ec7, #7873f5)" }} />
      <div className="absolute bottom-[-60px] right-[-60px] w-72 h-72 rounded-full opacity-25 blur-3xl"
        style={{ background: "radial-gradient(circle, #43e97b, #38f9d7)" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle, #f7971e, #ffd200)" }} />

      <div className="relative w-full max-w-lg z-10">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 shadow-2xl"
            style={{ background: "linear-gradient(135deg, #f093fb, #f5576c)" }}>
            <span className="text-4xl">🎬</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight drop-shadow-lg">
            Films Finder
          </h1>
          <p className="text-purple-300 mt-2 text-base font-medium">
            Discover the greatest Bollywood classics
          </p>
          <div className="flex justify-center gap-1 mt-3">
            {["#f093fb", "#f5576c", "#4facfe", "#43e97b", "#ffd200"].map((c, i) => (
              <span key={i} className="w-2 h-2 rounded-full" style={{ background: c }} />
            ))}
          </div>
        </div>

        {/* Search card */}
        <div
          className="rounded-3xl p-6 shadow-2xl border border-white/10"
          style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(20px)" }}
        >
          <div className="flex gap-3 mb-5">
            <input
              type="text"
              placeholder="Type an actor's name…"
              value={actor}
              onChange={(e) => setActor(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              className="flex-1 rounded-2xl px-4 py-3 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-400 border border-white/20 transition placeholder-white/30"
              style={{ background: "rgba(255,255,255,0.1)" }}
            />
            <button
              onClick={() => search()}
              disabled={loading}
              className="px-6 py-3 rounded-2xl text-white font-bold text-sm shadow-lg active:scale-95 transition-all disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}
            >
              {loading ? "⏳" : "Search"}
            </button>
          </div>

          <p className="text-white/40 text-xs mb-2 font-semibold uppercase tracking-widest">Quick picks</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s.name}
                onClick={() => handleSuggestion(s.name)}
                className={`text-xs font-semibold text-white rounded-full px-4 py-1.5 bg-gradient-to-r ${s.color} shadow-md hover:scale-105 active:scale-95 transition-transform`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="mt-4 rounded-2xl px-5 py-4 border text-sm font-medium"
            style={{ background: "rgba(239,68,68,0.15)", borderColor: "rgba(239,68,68,0.3)", color: "#fca5a5" }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-6 text-center text-white/50 text-sm animate-pulse">
            Searching the archives…
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-6 space-y-3">
            <div className="text-center mb-4">
              <span className="text-white/50 text-xs uppercase tracking-widest font-semibold">Top 3 Films of</span>
              <h2
                className="text-2xl font-black text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(135deg, #f093fb, #f5576c, #ffd200)" }}
              >
                {result.actor}
              </h2>
            </div>

            {result.films.map((film, i) => (
              <div
                key={i}
                className="rounded-2xl p-4 flex items-center gap-4 border border-white/10 hover:scale-[1.02] transition-transform cursor-default"
                style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)" }}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black bg-gradient-to-br ${medalColors[i].bg} shadow-lg flex-shrink-0`}>
                  {medals[i]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-base truncate">{film.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-xs rounded-full px-2 py-0.5 font-semibold"
                      style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
                    >
                      {film.genre}
                    </span>
                    <span className="text-white/30 text-xs">{film.year}</span>
                  </div>
                </div>
                <span className="text-3xl font-black text-white/10">#{i + 1}</span>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-white/20 text-xs mt-10 font-medium tracking-wide">
          Built with Next.js · Tailwind CSS · Neon DB · ❤️
        </p>
      </div>
    </main>
  );
}
