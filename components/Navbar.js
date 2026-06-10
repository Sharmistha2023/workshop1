"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 border-b border-white/10"
      style={{ background: "rgba(15,12,41,0.85)", backdropFilter: "blur(16px)" }}>

      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 font-black text-white text-lg">
          🎬 <span>Films Finder</span>
        </Link>
        <Link href="/progress" className="text-white/50 hover:text-white text-xs font-semibold transition">
          Progress
        </Link>
        {session && (
          <Link href="/watchlist" className="text-white/50 hover:text-white text-xs font-semibold transition">
            Watchlist
          </Link>
        )}
        {session && (
          <Link href={`/profile/${session.user.id}`} className="text-white/50 hover:text-white text-xs font-semibold transition">
            Profile
          </Link>
        )}
      </div>

      <div className="flex items-center gap-3">
        {session ? (
          <>
            {session.user.image && (
              <Image src={session.user.image} alt={session.user.name} width={30} height={30}
                className="rounded-full border border-white/20" />
            )}
            <span className="text-white/60 text-xs hidden sm:block">{session.user.name}</span>
            <button onClick={() => signOut()}
              className="text-xs font-semibold text-white/50 hover:text-white border border-white/20 hover:border-white/40 rounded-xl px-3 py-1.5 transition">
              Sign out
            </button>
          </>
        ) : (
          <button onClick={() => signIn()}
            className="text-xs font-bold text-white px-4 py-1.5 rounded-xl transition hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
            Sign in
          </button>
        )}
      </div>
    </nav>
  );
}
