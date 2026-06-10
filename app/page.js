"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const suggestions = [
  { name: "Aamir Khan",       color: "from-orange-500 to-pink-500" },
  { name: "Shah Rukh Khan",   color: "from-blue-500 to-cyan-400" },
  { name: "Amitabh Bachchan", color: "from-yellow-500 to-orange-500" },
  { name: "Salman Khan",      color: "from-green-500 to-teal-400" },
  { name: "Hrithik Roshan",   color: "from-purple-500 to-pink-500" },
];

const medalColors = [
  { bg: "from-yellow-400 to-amber-500" },
  { bg: "from-slate-300 to-slate-400" },
  { bg: "from-orange-400 to-amber-600" },
];
const medals = ["🥇", "🥈", "🥉"];

export default function Home() {
  const router = useRouter();
  const [actor, setActor]         = useState("");
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [aiRecs, setAiRecs]       = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [dropdown, setDropdown]   = useState([]);
  const [showDrop, setShowDrop]   = useState(false);
  const debounceRef = useRef(null);
  const wrapRef     = useRef(null);

  // Autocomplete
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (actor.length < 2) { setDropdown([]); return; }
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(actor)}`);
      setDropdown(await res.json());
      setShowDrop(true);
    }, 280);
  }, [actor]);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e) { if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowDrop(false); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function search(name) {
    const query = (name ?? actor).trim();
    if (!query) { setError("Please enter an actor name."); return; }
    setLoading(true); setResult(null); setError(""); setAiRecs(null); setShowDrop(false);
    try {
      const res  = await fetch(`/api/films?actor=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Not found."); }
      else {
        setResult(data);
        fetchAiRecs(query);
      }
    } catch { setError("Failed to connect."); }
    finally { setLoading(false); }
  }

  async function fetchAiRecs(query) {
    setAiLoading(true);
    try {
      const res  = await fetch(`/api/recommend?actor=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (res.ok) setAiRecs(data.recommendation);
    } catch {}
    finally { setAiLoading(false); }
  }

  function pick(name) { setActor(name); setShowDrop(false); search(name); }

  return (
    <main className="min-h-screen pt-16"
      style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}>

      {/* Blobs */}
      <div className="fixed top-[-80px] left-[-80px] w-80 h-80 rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #ff6ec7, #7873f5)" }} />
      <div className="fixed bottom-[-60px] right-[-60px] w-72 h-72 rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #43e97b, #38f9d7)" }} />

      <div className="relative max-w-lg mx-auto px-4 py-12 z-10">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 shadow-2xl"
            style={{ background: "linear-gradient(135deg, #f093fb, #f5576c)" }}>
            <span className="text-4xl">🎬</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight drop-shadow-lg">Films Finder</h1>
          <p className="text-purple-300 mt-2 text-base font-medium">Discover the greatest Bollywood classics</p>
          <div className="flex justify-center gap-1 mt-3">
            {["#f093fb","#f5576c","#4facfe","#43e97b","#ffd200"].map((c,i)=>(
              <span key={i} className="w-2 h-2 rounded-full" style={{ background: c }} />
            ))}
          </div>
        </div>

        {/* Search card */}
        <div className="rounded-3xl p-6 shadow-2xl border border-white/10"
          style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(20px)" }}>

          {/* Input + autocomplete */}
          <div className="relative mb-5" ref={wrapRef}>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Type an actor's name…"
                value={actor}
                onChange={e => setActor(e.target.value)}
                onFocus={() => dropdown.length && setShowDrop(true)}
                onKeyDown={e => { if (e.key === "Enter") search(); if (e.key === "Escape") setShowDrop(false); }}
                className="flex-1 rounded-2xl px-4 py-3 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-400 border border-white/20 transition placeholder-white/30"
                style={{ background: "rgba(255,255,255,0.1)" }}
              />
              <button onClick={() => search()} disabled={loading}
                className="px-6 py-3 rounded-2xl text-white font-bold text-sm shadow-lg active:scale-95 transition-all disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
                {loading ? "⏳" : "Search"}
              </button>
            </div>

            {/* Dropdown */}
            {showDrop && dropdown.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-white/10 overflow-hidden z-50 shadow-2xl"
                style={{ background: "rgba(30,27,75,0.97)", backdropFilter: "blur(20px)" }}>
                {dropdown.map(a => (
                  <button key={a.id} onClick={() => pick(a.name)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition text-left">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
                      {a.photo_url
                        ? <img src={a.photo_url} alt={a.name} className="w-full h-full rounded-full object-cover" />
                        : "🎭"}
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">{a.name}</p>
                      <p className="text-white/40 text-xs">{a.film_count} films</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick chips */}
          <p className="text-white/40 text-xs mb-2 font-semibold uppercase tracking-widest">Quick picks</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map(s => (
              <button key={s.name} onClick={() => pick(s.name)}
                className={`text-xs font-semibold text-white rounded-full px-4 py-1.5 bg-gradient-to-r ${s.color} shadow-md hover:scale-105 active:scale-95 transition-transform`}>
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-2xl px-5 py-4 border text-sm font-medium"
            style={{ background:"rgba(239,68,68,0.15)", borderColor:"rgba(239,68,68,0.3)", color:"#fca5a5" }}>
            ⚠️ {error}
          </div>
        )}

        {loading && <div className="mt-6 text-center text-white/50 text-sm animate-pulse">Searching the archives…</div>}

        {/* Results */}
        {result && (
          <div className="mt-6 space-y-3">
            <div className="text-center mb-4">
              <span className="text-white/50 text-xs uppercase tracking-widest font-semibold">Top 3 Films of</span>
              <h2 className="text-2xl font-black text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(135deg, #f093fb, #f5576c, #ffd200)" }}>
                {result.actor}
              </h2>
            </div>

            {result.films.map((film, i) => (
              <button key={i} onClick={() => router.push(`/film/${film.id}`)}
                className="w-full rounded-2xl p-4 flex items-center gap-4 border border-white/10 hover:border-purple-500/50 hover:scale-[1.02] transition-all text-left"
                style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)" }}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black bg-gradient-to-br ${medalColors[i].bg} shadow-lg flex-shrink-0`}>
                  {medals[i]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-base truncate">{film.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs rounded-full px-2 py-0.5 font-semibold"
                      style={{ background:"rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.6)" }}>{film.genre}</span>
                    <span className="text-white/30 text-xs">{film.year}</span>
                  </div>
                </div>
                <span className="text-white/20 text-xs">→</span>
              </button>
            ))}

            {/* Share card */}
            <button
              onClick={() => {
                const text = `🎬 My Top 3 Films by ${result.actor}:\n${result.films.map((f,i) => `${medals[i]} ${f.title} (${f.year})`).join("\n")}\n\nDiscover yours at Films Finder!`;
                if (navigator.share) {
                  navigator.share({ title: `Top 3 Films: ${result.actor}`, text });
                } else {
                  navigator.clipboard.writeText(text);
                  alert("Copied to clipboard!");
                }
              }}
              className="w-full rounded-2xl p-3 flex items-center justify-center gap-2 border border-white/10 hover:border-purple-500/40 transition text-xs font-semibold text-white/50 hover:text-white/80"
              style={{ background: "rgba(255,255,255,0.04)" }}>
              🔗 Share this list
            </button>

            {/* AI Recommendations */}
            <div className="mt-4 rounded-2xl border border-purple-500/20 overflow-hidden"
              style={{ background: "rgba(168,85,247,0.07)" }}>
              <div className="px-4 py-3 border-b border-purple-500/10 flex items-center gap-2">
                <span className="text-purple-400 text-sm">✨</span>
                <span className="text-purple-300 text-xs font-bold uppercase tracking-widest">AI Recommendations</span>
              </div>
              <div className="px-4 py-3">
                {aiLoading
                  ? <p className="text-white/30 text-sm animate-pulse">Thinking…</p>
                  : aiRecs
                    ? <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">{aiRecs}</p>
                    : <p className="text-white/30 text-sm">No recommendations yet.</p>
                }
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-white/20 text-xs mt-10 font-medium tracking-wide">
          Built with Next.js · Tailwind CSS · Neon DB · ❤️
        </p>
      </div>
    </main>
  );
}
