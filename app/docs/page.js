import Link from "next/link";

export const metadata = {
  title: "Public API Docs | Films Finder",
  description: "REST API for Films Finder — access Indian cinema data programmatically.",
};

const ENDPOINTS = [
  {
    method: "GET",
    path: "/api/v1/films",
    desc: "List films. Optional query params: actor, language, limit (max 100).",
    example: `curl -H "Authorization: Bearer YOUR_API_KEY" \\
  "https://workshop1-woad.vercel.app/api/v1/films?language=Tamil&limit=5"`,
    response: `{
  "data": [
    {
      "id": 42,
      "title": "Enthiran",
      "year": 2010,
      "genre": "Science Fiction/Action",
      "language": "Tamil",
      "rating": null,
      "overview": null,
      "actor": "Rajinikanth"
    }
  ],
  "count": 1
}`,
  },
  {
    method: "GET",
    path: "/api/v1/actors",
    desc: "List actors. Optional query params: q (search), limit (max 100).",
    example: `curl -H "Authorization: Bearer YOUR_API_KEY" \\
  "https://workshop1-woad.vercel.app/api/v1/actors?q=khan"`,
    response: `{
  "data": [
    {
      "id": 1,
      "name": "Aamir Khan",
      "bio": "...",
      "photo_url": "...",
      "film_count": "3"
    }
  ],
  "count": 1
}`,
  },
];

export default function DocsPage() {
  return (
    <main className="min-h-screen pt-20 pb-16 px-4"
      style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-white mb-2">🔌 Public API</h1>
          <p className="text-white/50 text-sm">
            Access Indian cinema data from Films Finder.{" "}
            <Link href="/profile/1" className="text-purple-400 hover:text-purple-300">
              Get your API key →
            </Link>
          </p>
        </div>

        {/* Auth */}
        <div className="rounded-2xl p-5 border border-white/10 mb-8"
          style={{ background: "rgba(255,255,255,0.05)" }}>
          <h2 className="text-white font-bold mb-2">Authentication</h2>
          <p className="text-white/50 text-sm mb-3">
            Pass your API key as a Bearer token or ?api_key= parameter.
          </p>
          <pre className="rounded-xl p-4 text-xs text-green-300 overflow-x-auto"
            style={{ background: "rgba(0,0,0,0.4)" }}>
{`Authorization: Bearer ff_your_key_here
# or
?api_key=ff_your_key_here`}
          </pre>
        </div>

        {/* Endpoints */}
        <h2 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4">Endpoints</h2>
        <div className="space-y-6">
          {ENDPOINTS.map((ep, i) => (
            <div key={i} className="rounded-2xl border border-white/10 overflow-hidden"
              style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
                <span className="px-2 py-0.5 rounded text-xs font-bold"
                  style={{ background: "rgba(102,126,234,0.3)", color: "#a78bfa" }}>
                  {ep.method}
                </span>
                <code className="text-white font-mono text-sm">{ep.path}</code>
              </div>
              <div className="px-5 py-4">
                <p className="text-white/60 text-sm mb-4">{ep.desc}</p>
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Example</p>
                <pre className="rounded-xl p-3 text-xs text-green-300 overflow-x-auto mb-4"
                  style={{ background: "rgba(0,0,0,0.4)" }}>
                  {ep.example}
                </pre>
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Response</p>
                <pre className="rounded-xl p-3 text-xs text-blue-300 overflow-x-auto"
                  style={{ background: "rgba(0,0,0,0.4)" }}>
                  {ep.response}
                </pre>
              </div>
            </div>
          ))}
        </div>

        {/* Rate limits */}
        <div className="mt-8 rounded-2xl p-5 border border-white/10"
          style={{ background: "rgba(255,255,255,0.04)" }}>
          <h2 className="text-white font-bold mb-2">Rate Limits</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-white/40 text-xs uppercase font-bold mb-1">Free tier</p>
              <p className="text-white/70">100 requests / day</p>
            </div>
            <div>
              <p className="text-white/40 text-xs uppercase font-bold mb-1">Premium tier</p>
              <p className="text-white/70">10,000 requests / day</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-purple-400 text-sm hover:text-purple-300 transition">
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
