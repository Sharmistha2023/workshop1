# 🎬 Films Finder

A full-stack Indian cinema discovery platform built with Next.js 14, Neon PostgreSQL, and AI-powered recommendations. Search actors, explore films, track your watch history, and connect with friends.

**Live:** [workshop1-woad.vercel.app](https://workshop1-woad.vercel.app)

---

## Features

### Phase 1 — Core Discovery
- **Actor search** with live autocomplete and actor photos (TMDB)
- **Film detail pages** — poster, synopsis, cast, genre, year, TMDB rating
- **Streaming availability** — Netflix, Prime Video, Hotstar and more (via TMDB)
- **AI recommendations** — Claude-powered suggestions based on genre/tone themes
- **pgvector embeddings** — vector similarity search for related films
- **Google & GitHub OAuth** — sign in with NextAuth v4

### Phase 2 — Social Features
- **Personal watchlist** — save and remove films
- **Ratings & reviews** — 1–5 star ratings with text reviews
- **Watch history & streaks** — track films you've seen, daily streak counter
- **Public profiles** — follow/unfollow users, view their watchlist and reviews
- **Friend activity feed** — see what people you follow are watching and reviewing
- **Share card** — copy/share your top-3 list as text
- **Open Graph tags** — rich preview cards when sharing on social media

### Phase 3 — Scale & Monetisation
- **Actor SEO pages** — static `/actor/[slug]` pages with metadata for every actor
- **Trending page** — most saved, highest rated, most watched films in real time
- **Year-in-Review** — browse all films grouped by release year
- **Regional cinema** — Tamil, Telugu, Malayalam films with language filter tabs
- **Crowdsourced edits** — signed-in users can suggest corrections to film data
- **Affiliate links** — streaming provider buttons link directly to platforms with UTM tracking
- **Premium tier** — `/premium` page with Free vs ₹299/month feature comparison
- **Public REST API** — `/api/v1/films` and `/api/v1/actors` with API key authentication
- **API docs** — self-serve documentation at `/docs`
- **Analytics dashboard** — KPIs, top films, language breakdown, active users, daily activity

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 14](https://nextjs.org/) — App Router, Server Components |
| Language | JavaScript (ES2022) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Database | [Neon](https://neon.tech/) — serverless PostgreSQL |
| ORM | `@neondatabase/serverless` (tagged template SQL) |
| Vector search | [pgvector](https://github.com/pgvector/pgvector) |
| Auth | [NextAuth v4](https://next-auth.js.org/) — GitHub + Google OAuth |
| AI / LLM | [OpenRouter](https://openrouter.ai/) → `anthropic/claude-sonnet-4-6` |
| Film data | [TMDB API](https://www.themoviedb.org/documentation/api) |
| Deployment | [Vercel](https://vercel.com/) |

---

## Database Schema

```
actors         — id, name, tmdb_id, photo_url, bio
films          — id, actor_id, title, year, genre, language, rank, rating, overview,
                 poster_url, tmdb_id, embedding (vector)
users          — id, email, name, image, is_premium, created_at
watchlist      — id, user_id, film_id, added_at
reviews        — id, user_id, film_id, rating (1-5), body, created_at
watch_history  — id, user_id, film_id, watched_at
user_follows   — follower_id, following_id
suggestions    — id, user_id, entity_type, entity_id, field_name, suggested_value, status
api_keys       — id, user_id, key_hash, key_prefix, label, last_used_at
development_process — phase tracking table (24 tasks across 3 phases)
```

---

## API Reference

All public endpoints require an API key (generate one from your profile page).

```
GET /api/v1/films?actor=aamir+khan&limit=10
GET /api/v1/actors?q=khan

Authorization: Bearer ff_your_key_here
```

Full documentation: [workshop1-woad.vercel.app/docs](https://workshop1-woad.vercel.app/docs)

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [Neon](https://neon.tech/) PostgreSQL database
- GitHub and/or Google OAuth app credentials
- [OpenRouter](https://openrouter.ai/) API key (for AI recommendations)
- [TMDB](https://www.themoviedb.org/) API key (for posters and streaming data)

### Local Setup

```bash
git clone https://github.com/Sharmistha2023/workshop1.git
cd workshop1
npm install
```

Create `.env.local`:

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-random-secret
NEXTAUTH_URL=http://localhost:3000
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
LLM_MODEL=anthropic/claude-sonnet-4.6
TMDB_API_KEY=...
```

Run database migrations:

```bash
node scripts/migrate-phase2.js
node scripts/migrate-phase3.js
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
app/
  page.js                  # Home — search + results + AI recs
  actor/[slug]/page.js     # Static SEO actor pages
  film/[id]/page.js        # Film detail — watchlist, reviews, streaming
  watchlist/page.js        # Personal watchlist
  profile/[userId]/page.js # Public profile + API key management
  trending/page.js         # Trending films
  year-in-review/page.js   # Films by year
  regional/page.js         # Regional cinema filter
  premium/page.js          # Premium tier page
  docs/page.js             # Public API documentation
  analytics/page.js        # Admin analytics dashboard
  api/
    films/                 # Top 3 films by actor
    search/                # Actor autocomplete
    film/[id]/             # Film detail data
    streaming/[id]/        # TMDB watch providers
    watchlist/             # Watchlist CRUD
    reviews/               # Reviews CRUD
    history/               # Watch history + streak
    recommend/             # AI recommendations
    profile/[userId]/      # Public profile data
    feed/                  # Friend activity feed
    follow/                # Follow/unfollow
    suggest/               # Crowdsourced edit suggestions
    apikeys/               # API key management
    v1/films/              # Public API — films
    v1/actors/             # Public API — actors
components/
  Navbar.js                # Navigation with auth state
lib/
  db.js                    # Neon SQL client
  auth.js                  # NextAuth config
  llm.js                   # OpenRouter chat wrapper
scripts/
  migrate-phase2.js        # Phase 2 DB migrations
  migrate-phase3.js        # Phase 3 DB migrations
```

---

## Deployment

The app is deployed on Vercel with all environment variables set via `vercel env add`.

Required Vercel env vars mirror `.env.local` above — `NEXTAUTH_URL` should be set to your production domain.

---

## Author

**Sharmistha Choudhury** — [@Sharmistha2023](https://github.com/Sharmistha2023)
