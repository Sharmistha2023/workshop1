const { neon } = require("@neondatabase/serverless");
require("dotenv").config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log("Running Phase 2 migrations...");

  await sql`
    CREATE TABLE IF NOT EXISTS watchlist (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
      film_id    INTEGER REFERENCES films(id) ON DELETE CASCADE,
      added_at   TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, film_id)
    )
  `;
  console.log("✓ watchlist");

  await sql`
    CREATE TABLE IF NOT EXISTS reviews (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
      film_id    INTEGER REFERENCES films(id) ON DELETE CASCADE,
      rating     INTEGER CHECK (rating BETWEEN 1 AND 5),
      body       TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, film_id)
    )
  `;
  console.log("✓ reviews");

  await sql`
    CREATE TABLE IF NOT EXISTS watch_history (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
      film_id    INTEGER REFERENCES films(id) ON DELETE CASCADE,
      watched_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, film_id)
    )
  `;
  console.log("✓ watch_history");

  await sql`
    CREATE TABLE IF NOT EXISTS user_follows (
      follower_id  INTEGER REFERENCES users(id) ON DELETE CASCADE,
      following_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at   TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (follower_id, following_id)
    )
  `;
  console.log("✓ user_follows");

  console.log("All Phase 2 migrations complete.");
  process.exit(0);
}

migrate().catch(err => { console.error(err); process.exit(1); });
