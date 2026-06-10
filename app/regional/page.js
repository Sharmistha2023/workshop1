"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const LANGUAGES = [
  { code: "All",       label: "All Languages", emoji: "🌐" },
  { code: "Hindi",     label: "Hindi (Bollywood)", emoji: "🎬" },
  { code: "Tamil",     label: "Tamil",   emoji: "🌟" },
  { code: "Telugu",    label: "Telugu",  emoji: "💫" },
  { code: "Malayalam", label: "Malayalam", emoji: "🌴" },
];

export default function RegionalPage() {
  const [lang, setLang] = useState("All");
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/regional?lang=${encodeURIComponent(lang)}`)
      .then(r => r.json())
      .then(d => { setFilms(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [lang]);

  return (
    <main className="min-h-screen pt-20 pb-16 px-4"
      style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white">🌐 Regional Cinema</h1>
          <p className="text-white/40 mt-2 text-sm">Explore films across Indian film industries</p>
        </div>

        {/* Language tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {LANGUAGES.map(l => (
            <button key={l.code} onClick={() => setLang(l.code)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                lang === l.code
                  ? "text-white shadow-lg scale-105"
                  : "text-white/50 hover:text-white/80"
              }`}
              style={lang === l.code
                ? { background: "linear-gradient(135deg, #667eea, #764ba2)" }
                : { background: "rgba(255,255,255,0.08)" }}>
              {l.emoji} {l.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-white/30 text-sm animate-pulse py-20">Loading films…</div>
        ) : (
          <div className="space-y-2">
            {films.map(film => (
              <Link key={film.id} href={`/film/${film.id}`}
                className="flex items-center gap-4 rounded-2xl p-4 border border-white/10 hover:border-purple-500/30 hover:scale-[1.01] transition-all"
                style={{ background: "rgba(255,255,255,0.05)" }}>
                {film.poster_url ? (
                  <img src={film.poster_url} alt={film.title}
                    className="w-12 h-16 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-16 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #f093fb, #f5576c)" }}>🎬</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold truncate">{film.title}</p>
                  <p className="text-white/50 text-sm">{film.actor_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs rounded-full px-2 py-0.5"
                      style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.55)" }}>
                      {film.genre}
                    </span>
                    <span className="text-white/30 text-xs">{film.year}</span>
                    <span className="text-xs rounded-full px-2 py-0.5"
                      style={{ background: "rgba(102,126,234,0.2)", color: "rgba(167,139,250,0.9)" }}>
                      {film.language}
                    </span>
                  </div>
                </div>
                <span className="text-white/20 text-sm">→</span>
              </Link>
            ))}
            {films.length === 0 && (
              <p className="text-center text-white/30 py-12">No films found for this language.</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
