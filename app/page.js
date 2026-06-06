"use client";

import { useState } from "react";

const movies = {
  "aamir khan": [
    { title: "3 Idiots", year: 2009, genre: "Comedy Drama" },
    { title: "Lagaan", year: 2001, genre: "Period Drama" },
    { title: "Taare Zameen Par", year: 2007, genre: "Drama" },
  ],
  "shah rukh khan": [
    { title: "Swades", year: 2004, genre: "Drama" },
    { title: "Chak De! India", year: 2007, genre: "Sports Drama" },
    { title: "Dilwale Dulhania Le Jayenge", year: 1995, genre: "Romance" },
  ],
  "amitabh bachchan": [
    { title: "Deewaar", year: 1975, genre: "Crime Drama" },
    { title: "Sholay", year: 1975, genre: "Action Adventure" },
    { title: "Paa", year: 2009, genre: "Drama" },
  ],
  "salman khan": [
    { title: "Bajrangi Bhaijaan", year: 2015, genre: "Drama" },
    { title: "Sultan", year: 2016, genre: "Sports Drama" },
    { title: "Hum Aapke Hain Koun", year: 1994, genre: "Romance" },
  ],
  "hrithik roshan": [
    { title: "Koi... Mil Gaya", year: 2003, genre: "Sci-Fi Drama" },
    { title: "Jodhaa Akbar", year: 2008, genre: "Historical Romance" },
    { title: "Zindagi Na Milegi Dobara", year: 2011, genre: "Adventure" },
  ],
};

const suggestions = [
  "Aamir Khan",
  "Shah Rukh Khan",
  "Amitabh Bachchan",
  "Salman Khan",
  "Hrithik Roshan",
];

function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

const medals = ["🥇", "🥈", "🥉"];

export default function Home() {
  const [actor, setActor] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function search(name) {
    const key = (name || actor).trim().toLowerCase();
    if (!key) {
      setError("Please enter an actor name.");
      setResult(null);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      if (movies[key]) {
        setResult({ name: toTitleCase(key), films: movies[key] });
        setError("");
      } else {
        setError(`No results for "${toTitleCase(key)}". Try one of the suggested actors below.`);
        setResult(null);
      }
      setLoading(false);
    }, 400);
  }

  function handleSuggestion(name) {
    setActor(name);
    search(name);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">🎬</div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Top 3 Films Finder
          </h1>
          <p className="text-purple-300 mt-2 text-sm">
            Discover the greatest films of Bollywood legends
          </p>
        </div>

        {/* Search card */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">

          {/* Input row */}
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter actor name…"
              value={actor}
              onChange={(e) => setActor(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              className="flex-1 bg-white/10 text-white placeholder-white/40 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
            <button
              onClick={() => search()}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold px-5 py-3 rounded-xl text-sm transition-all active:scale-95"
            >
              {loading ? "..." : "Search"}
            </button>
          </div>

          {/* Suggestion chips */}
          <div className="flex flex-wrap gap-2 mt-4">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => handleSuggestion(s)}
                className="text-xs bg-white/10 hover:bg-purple-600/50 text-purple-200 hover:text-white border border-white/10 hover:border-purple-500 rounded-full px-3 py-1 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-6 space-y-3">
            <h2 className="text-white font-bold text-lg text-center">
              Top 3 Films of{" "}
              <span className="text-purple-400">{result.name}</span>
            </h2>

            {result.films.map((film, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 hover:border-purple-500/50 rounded-2xl px-5 py-4 flex items-center gap-4 transition-all hover:bg-white/10 group"
              >
                <span className="text-2xl">{medals[i]}</span>
                <div className="flex-1">
                  <p className="text-white font-semibold group-hover:text-purple-300 transition-colors">
                    {film.title}
                  </p>
                  <p className="text-white/40 text-xs mt-0.5">
                    {film.genre} · {film.year}
                  </p>
                </div>
                <span className="text-white/20 text-xs font-bold">#{i + 1}</span>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-white/20 text-xs mt-10">
          Built with Next.js · Tailwind CSS
        </p>
      </div>
    </main>
  );
}
