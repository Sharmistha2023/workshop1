"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

const FEATURES = {
  free: [
    "Search any actor",
    "View top 3 films",
    "Watchlist (up to 20 films)",
    "Ratings & reviews",
    "Watch history",
    "Public profile",
    "AI recommendations",
    "Share top-3 card",
  ],
  premium: [
    "Everything in Free",
    "Unlimited watchlist",
    "Ad-free experience",
    "Early access to new features",
    "Public API access (5 keys)",
    "Export watchlist as PDF",
    "Premium badge on profile",
    "Priority support",
  ],
};

export default function PremiumPage() {
  const { data: session } = useSession();
  const [upgrading, setUpgrading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleUpgrade() {
    if (!session) {
      window.location.href = "/api/auth/signin";
      return;
    }
    setUpgrading(true);
    await new Promise(r => setTimeout(r, 1500));
    setDone(true);
    setUpgrading(false);
  }

  return (
    <main className="min-h-screen pt-20 pb-16 px-4"
      style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-2xl text-3xl"
            style={{ background: "linear-gradient(135deg, #ffd200, #f093fb)" }}>
            👑
          </div>
          <h1 className="text-4xl font-black text-white">Films Finder Premium</h1>
          <p className="text-white/40 mt-2 text-sm">Unlock the full experience</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Free */}
          <div className="rounded-3xl p-6 border border-white/10"
            style={{ background: "rgba(255,255,255,0.05)" }}>
            <h2 className="text-lg font-bold text-white mb-1">Free</h2>
            <p className="text-3xl font-black text-white mb-4">₹0<span className="text-sm text-white/40 font-normal">/month</span></p>
            <ul className="space-y-2">
              {FEATURES.free.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                  <span className="text-green-400 text-xs">✓</span> {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Premium */}
          <div className="rounded-3xl p-6 border-2 relative overflow-hidden"
            style={{ borderColor: "#ffd200", background: "rgba(255,210,0,0.05)" }}>
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-bold"
              style={{ background: "linear-gradient(135deg, #ffd200, #f093fb)", color: "#0f0c29" }}>
              POPULAR
            </div>
            <h2 className="text-lg font-bold text-white mb-1">Premium</h2>
            <p className="text-3xl font-black text-white mb-4">
              ₹299<span className="text-sm text-white/40 font-normal">/month</span>
            </p>
            <ul className="space-y-2 mb-6">
              {FEATURES.premium.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/80">
                  <span className="text-yellow-400 text-xs">✓</span> {f}
                </li>
              ))}
            </ul>

            {done ? (
              <div className="rounded-2xl p-3 text-center text-sm font-semibold text-green-300"
                style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)" }}>
                🎉 You&apos;re now Premium! Enjoy the full experience.
              </div>
            ) : (
              <button onClick={handleUpgrade} disabled={upgrading}
                className="w-full py-3 rounded-2xl font-bold text-sm shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #ffd200, #f093fb)", color: "#0f0c29" }}>
                {upgrading ? "Processing…" : session ? "Upgrade Now →" : "Sign in to Upgrade →"}
              </button>
            )}
          </div>
        </div>

        <div className="rounded-2xl p-4 border border-white/10 text-center text-white/30 text-xs"
          style={{ background: "rgba(255,255,255,0.03)" }}>
          Payment demo — no real charges. For production, integrate Razorpay or Stripe.
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-purple-400 text-sm hover:text-purple-300 transition">
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
