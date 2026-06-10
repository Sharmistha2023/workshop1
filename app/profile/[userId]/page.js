"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";

function StarDisplay({ value }) {
  return (
    <span className="text-yellow-400 text-xs">
      {"★".repeat(value)}{"☆".repeat(5 - value)}
    </span>
  );
}

export default function ProfilePage() {
  const { userId } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [profile, setProfile] = useState(null);
  const [loading, setLoad]    = useState(true);
  const [following, setFollowing] = useState(false);
  const [followLoad, setFLoad]    = useState(false);

  useEffect(() => {
    fetch(`/api/profile/${userId}`)
      .then(r => r.json())
      .then(d => { setProfile(d); setLoad(false); })
      .catch(() => setLoad(false));
  }, [userId]);

  async function toggleFollow() {
    if (!session) { router.push("/auth/signin"); return; }
    setFLoad(true);
    const method = following ? "DELETE" : "POST";
    await fetch("/api/follow", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: Number(userId) }),
    });
    setFollowing(!following);
    setFLoad(false);
  }

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}>
      <p className="text-white/40 animate-pulse">Loading profile…</p>
    </main>
  );

  if (!profile || profile.error) return (
    <main className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}>
      <p className="text-red-400">User not found.</p>
    </main>
  );

  const isOwnProfile = session?.user?.id === Number(userId);

  return (
    <main className="min-h-screen pt-20 pb-12"
      style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}>

      <div className="fixed top-0 right-0 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #f093fb, #f5576c)" }} />

      <div className="relative max-w-2xl mx-auto px-4 z-10">

        {/* Profile header */}
        <div className="rounded-3xl border border-white/10 p-6 mb-6"
          style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)" }}>
          <div className="flex items-center gap-5">
            {profile.user.image
              ? <Image src={profile.user.image} alt={profile.user.name} width={72} height={72} className="rounded-full border-2 border-purple-500/30" />
              : <div className="w-18 h-18 rounded-full flex items-center justify-center text-3xl"
                  style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", width: 72, height: 72 }}>
                  👤
                </div>}
            <div className="flex-1">
              <h1 className="text-2xl font-black text-white">{profile.user.name}</h1>
              <div className="flex gap-4 mt-1 text-xs text-white/40">
                <span><strong className="text-white">{profile.followers}</strong> followers</span>
                <span><strong className="text-white">{profile.following}</strong> following</span>
                <span><strong className="text-white">{profile.watched_total}</strong> watched</span>
              </div>
            </div>
            {!isOwnProfile && (
              <button onClick={toggleFollow} disabled={followLoad}
                className="text-xs font-bold px-4 py-2 rounded-xl transition disabled:opacity-40"
                style={following
                  ? { background: "rgba(168,85,247,0.25)", color: "#c084fc", border: "1px solid rgba(168,85,247,0.4)" }
                  : { background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white" }}>
                {following ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </div>

        {/* Watchlist */}
        {profile.watchlist.length > 0 && (
          <div className="mb-6">
            <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-3">Watchlist</p>
            <div className="grid grid-cols-2 gap-2">
              {profile.watchlist.slice(0, 6).map(f => (
                <button key={f.id} onClick={() => router.push(`/film/${f.id}`)}
                  className="text-left rounded-2xl border border-white/10 px-4 py-3 hover:border-purple-500/40 transition"
                  style={{ background: "rgba(255,255,255,0.04)" }}>
                  <p className="text-white font-semibold text-sm truncate">{f.title}</p>
                  <p className="text-white/40 text-xs">{f.actor_name} · {f.year}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        {profile.reviews.length > 0 && (
          <div>
            <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-3">Reviews</p>
            <div className="space-y-2">
              {profile.reviews.map((r, i) => (
                <button key={i} onClick={() => router.push(`/film/${r.film_id}`)}
                  className="w-full text-left rounded-2xl border border-white/10 px-4 py-3 hover:border-purple-500/40 transition"
                  style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div className="flex items-center justify-between">
                    <p className="text-white font-semibold text-sm">{r.title} ({r.year})</p>
                    <StarDisplay value={r.rating} />
                  </div>
                  {r.body && <p className="text-white/50 text-xs mt-1">{r.body}</p>}
                </button>
              ))}
            </div>
          </div>
        )}

        {profile.watchlist.length === 0 && profile.reviews.length === 0 && (
          <p className="text-center text-white/30 text-sm mt-8">No activity yet.</p>
        )}
      </div>
    </main>
  );
}
