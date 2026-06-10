"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";

const medals = ["🥇", "🥈", "🥉"];

function StarRating({ value, onChange, readOnly }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" disabled={readOnly}
          onClick={() => onChange?.(n)}
          className={`text-xl transition ${readOnly ? "cursor-default" : "hover:scale-110"} ${n <= value ? "text-yellow-400" : "text-white/20"}`}>
          ★
        </button>
      ))}
    </div>
  );
}

function ReviewSection({ filmId, session }) {
  const [reviews, setReviews]   = useState([]);
  const [rating, setRating]     = useState(0);
  const [body, setBody]         = useState("");
  const [submitting, setSubmit] = useState(false);
  const [tick, setTick]         = useState(0);

  useEffect(() => {
    fetch(`/api/reviews?film_id=${filmId}`)
      .then(r => r.json()).then(setReviews).catch(() => {});
  }, [filmId, tick]);

  async function submit(e) {
    e.preventDefault();
    if (!rating) return;
    setSubmit(true);
    await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ film_id: Number(filmId), rating, body }),
    });
    setRating(0); setBody(""); setSubmit(false); setTick(t => t + 1);
  }

  return (
    <div className="mt-6">
      <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-3">Reviews</p>

      {session && (
        <form onSubmit={submit} className="rounded-2xl border border-white/10 p-4 mb-4"
          style={{ background: "rgba(255,255,255,0.04)" }}>
          <p className="text-white text-sm font-semibold mb-2">Write a review</p>
          <StarRating value={rating} onChange={setRating} />
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Share your thoughts… (optional)"
            rows={2}
            className="w-full mt-2 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 border border-white/10 focus:outline-none focus:ring-1 focus:ring-purple-400 resize-none"
            style={{ background: "rgba(255,255,255,0.06)" }}
          />
          <button type="submit" disabled={!rating || submitting}
            className="mt-2 px-4 py-1.5 rounded-xl text-xs font-bold text-white disabled:opacity-40 transition"
            style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
            {submitting ? "Saving…" : "Post Review"}
          </button>
        </form>
      )}

      {!session && (
        <p className="text-white/30 text-sm mb-3">
          <a href="/auth/signin" className="text-purple-400 hover:underline">Sign in</a> to leave a review.
        </p>
      )}

      {reviews.length === 0
        ? <p className="text-white/30 text-sm">No reviews yet.</p>
        : reviews.map((r, i) => (
          <div key={i} className="rounded-2xl border border-white/10 p-4 mb-2"
            style={{ background: "rgba(255,255,255,0.03)" }}>
            <div className="flex items-center gap-2 mb-1">
              {r.user_image && <img src={r.user_image} alt={r.user_name} className="w-6 h-6 rounded-full object-cover" />}
              <span className="text-white/70 text-xs font-semibold">{r.user_name}</span>
              <StarRating value={r.rating} readOnly />
            </div>
            {r.body && <p className="text-white/60 text-sm">{r.body}</p>}
          </div>
        ))}
    </div>
  );
}

const PLATFORM_LINKS = {
  "Netflix":       "https://www.netflix.com/search?q=",
  "Amazon Prime Video": "https://www.primevideo.com/search/ref=atv_sr_sug_3?phrase=",
  "Disney+ Hotstar": "https://www.hotstar.com/in/search?q=",
  "Apple TV+":     "https://tv.apple.com/",
  "JioCinema":     "https://www.jiocinema.com/search/",
  "ZEE5":          "https://www.zee5.com/search/",
  "SonyLIV":       "https://www.sonyliv.com/search/",
};

function affiliateUrl(name, title) {
  const base = PLATFORM_LINKS[name];
  if (!base) return null;
  return base + encodeURIComponent(title) + "?ref=filmsfinder&utm_source=filmsfinder&utm_medium=referral";
}

function StreamingSection({ filmId, filmTitle }) {
  const [data, setData] = useState(undefined);

  useEffect(() => {
    fetch(`/api/streaming/${filmId}`)
      .then(r => r.json()).then(setData).catch(() => setData(null));
  }, [filmId]);

  if (data === undefined) return null;
  if (!data?.providers) return null;

  const { flatrate = [], rent = [] } = data.providers;
  if (!flatrate.length && !rent.length) return null;

  return (
    <div className="mt-4 rounded-2xl border border-white/10 p-4"
      style={{ background: "rgba(255,255,255,0.04)" }}>
      <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-3">Where to Watch</p>
      <div className="flex flex-wrap gap-2">
        {flatrate.map(p => {
          const url = affiliateUrl(p.provider_name, filmTitle);
          return url ? (
            <a key={p.provider_id} href={url} target="_blank" rel="noopener noreferrer"
              className="text-xs font-semibold rounded-xl px-3 py-1.5 hover:scale-105 transition-transform"
              style={{ background: "rgba(16,185,129,0.15)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" }}>
              ▶ {p.provider_name} ↗
            </a>
          ) : (
            <span key={p.provider_id} className="text-xs font-semibold rounded-xl px-3 py-1.5"
              style={{ background: "rgba(16,185,129,0.15)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" }}>
              ▶ {p.provider_name}
            </span>
          );
        })}
        {rent.map(p => {
          const url = affiliateUrl(p.provider_name, filmTitle);
          return url ? (
            <a key={p.provider_id} href={url} target="_blank" rel="noopener noreferrer"
              className="text-xs font-semibold rounded-xl px-3 py-1.5 hover:scale-105 transition-transform"
              style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)" }}>
              💰 Rent: {p.provider_name} ↗
            </a>
          ) : (
            <span key={p.provider_id} className="text-xs font-semibold rounded-xl px-3 py-1.5"
              style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)" }}>
              💰 Rent: {p.provider_name}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function SuggestEditSection({ filmId, session }) {
  const [open, setOpen]     = useState(false);
  const [field, setField]   = useState("overview");
  const [value, setValue]   = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (!value) return;
    setStatus("saving");
    const res = await fetch("/api/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entityType: "film", entityId: Number(filmId), fieldName: field, suggestedValue: value, reason }),
    });
    const data = await res.json();
    setStatus(res.ok ? "done" : "error");
    if (res.ok) { setValue(""); setReason(""); }
  }

  if (!session) return null;

  return (
    <div className="mt-4">
      <button onClick={() => setOpen(!open)}
        className="text-xs text-white/30 hover:text-white/60 transition flex items-center gap-1">
        ✏️ Suggest an edit to this film
      </button>
      {open && (
        <form onSubmit={submit} className="mt-3 rounded-2xl border border-white/10 p-4"
          style={{ background: "rgba(255,255,255,0.04)" }}>
          <p className="text-white text-sm font-semibold mb-3">Suggest a correction</p>
          <select value={field} onChange={e => setField(e.target.value)}
            className="w-full rounded-xl px-3 py-2 text-sm text-white border border-white/10 mb-2 focus:outline-none"
            style={{ background: "rgba(255,255,255,0.08)" }}>
            <option value="overview">Plot overview</option>
            <option value="genre">Genre</option>
            <option value="year">Release year</option>
            <option value="poster_url">Poster URL</option>
            <option value="other">Other</option>
          </select>
          <textarea value={value} onChange={e => setValue(e.target.value)}
            placeholder="Correct value…" rows={2}
            className="w-full rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 border border-white/10 mb-2 focus:outline-none resize-none"
            style={{ background: "rgba(255,255,255,0.06)" }} />
          <input value={reason} onChange={e => setReason(e.target.value)}
            placeholder="Reason (optional)"
            className="w-full rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 border border-white/10 mb-2 focus:outline-none"
            style={{ background: "rgba(255,255,255,0.06)" }} />
          <button type="submit" disabled={!value || status === "saving"}
            className="px-4 py-1.5 rounded-xl text-xs font-bold text-white disabled:opacity-40 transition"
            style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
            {status === "saving" ? "Submitting…" : "Submit Suggestion"}
          </button>
          {status === "done" && <span className="ml-3 text-green-400 text-xs">✓ Submitted! Thank you.</span>}
          {status === "error" && <span className="ml-3 text-red-400 text-xs">Failed. Try again.</span>}
        </form>
      )}
    </div>
  );
}

export default function FilmPage() {
  const { id }    = useParams();
  const router    = useRouter();
  const { data: session } = useSession();
  const [film, setFilm]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [inWatchlist, setInWL]  = useState(false);
  const [wlLoading, setWLLoad]  = useState(false);
  const [markedWatched, setMW]  = useState(false);
  const [markLoading, setMarkL] = useState(false);

  useEffect(() => {
    fetch(`/api/film/${id}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setFilm(d); setLoading(false); })
      .catch(() => { setError("Failed to load film."); setLoading(false); });
  }, [id]);

  useEffect(() => {
    if (!session) return;
    fetch("/api/watchlist")
      .then(r => r.json())
      .then(list => setInWL(Array.isArray(list) && list.some(f => String(f.id) === String(id))));
  }, [session, id]);

  async function toggleWatchlist() {
    if (!session) { router.push("/auth/signin"); return; }
    setWLLoad(true);
    const method = inWatchlist ? "DELETE" : "POST";
    await fetch("/api/watchlist", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ film_id: Number(id) }),
    });
    setInWL(!inWatchlist);
    setWLLoad(false);
  }

  async function markWatched() {
    if (!session) { router.push("/auth/signin"); return; }
    setMarkL(true);
    await fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ film_id: Number(id) }),
    });
    setMarkL(false);
    setMW(true);
  }

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

      <div className="fixed top-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #f093fb, #f5576c)" }} />

      <div className="relative max-w-2xl mx-auto px-4 z-10">

        <button onClick={() => router.back()}
          className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition">
          ← Back
        </button>

        <div className="rounded-3xl border border-white/10 overflow-hidden mb-4"
          style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)" }}>

          <div className="flex gap-5 p-6">
            <div className="w-28 h-40 rounded-2xl flex-shrink-0 flex items-center justify-center text-5xl overflow-hidden"
              style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
              {film.poster_url
                ? <Image src={film.poster_url} alt={film.title} width={112} height={160} className="rounded-2xl object-cover w-full h-full" />
                : "🎬"}
            </div>

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

              <div className="flex gap-2 mt-4 flex-wrap">
                <button onClick={toggleWatchlist} disabled={wlLoading}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl transition disabled:opacity-40"
                  style={inWatchlist
                    ? { background: "rgba(168,85,247,0.25)", color: "#c084fc", border: "1px solid rgba(168,85,247,0.4)" }
                    : { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)" }}>
                  {inWatchlist ? "✓ Saved" : "+ Watchlist"}
                </button>
                <button onClick={markWatched} disabled={markLoading || markedWatched}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl transition disabled:opacity-40"
                  style={{ background: "rgba(16,185,129,0.15)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" }}>
                  {markedWatched ? "✓ Watched" : "Mark Watched"}
                </button>
              </div>
            </div>
          </div>

          {film.insight && (
            <div className="mx-6 mb-6 rounded-2xl px-4 py-3 border border-purple-500/20"
              style={{ background: "rgba(168,85,247,0.08)" }}>
              <p className="text-xs text-purple-400 font-semibold uppercase tracking-widest mb-1">AI Insight</p>
              <p className="text-white/70 text-sm leading-relaxed">{film.insight}</p>
            </div>
          )}
        </div>

        <StreamingSection filmId={id} filmTitle={film.title} />

        {film.same_actor_films?.length > 0 && (
          <div className="mt-4">
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

        <ReviewSection filmId={id} session={session} />
        <SuggestEditSection filmId={id} session={session} />
      </div>
    </main>
  );
}
