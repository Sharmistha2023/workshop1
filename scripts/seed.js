const { neon } = require("@neondatabase/serverless");
require("dotenv").config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

const data = [
  {
    actor: "Aamir Khan",
    films: [
      { title: "3 Idiots", year: 2009, genre: "Comedy Drama" },
      { title: "Lagaan", year: 2001, genre: "Period Drama" },
      { title: "Taare Zameen Par", year: 2007, genre: "Drama" },
    ],
  },
  {
    actor: "Shah Rukh Khan",
    films: [
      { title: "Swades", year: 2004, genre: "Drama" },
      { title: "Chak De! India", year: 2007, genre: "Sports Drama" },
      { title: "Dilwale Dulhania Le Jayenge", year: 1995, genre: "Romance" },
    ],
  },
  {
    actor: "Amitabh Bachchan",
    films: [
      { title: "Deewaar", year: 1975, genre: "Crime Drama" },
      { title: "Sholay", year: 1975, genre: "Action Adventure" },
      { title: "Paa", year: 2009, genre: "Drama" },
    ],
  },
  {
    actor: "Salman Khan",
    films: [
      { title: "Bajrangi Bhaijaan", year: 2015, genre: "Drama" },
      { title: "Sultan", year: 2016, genre: "Sports Drama" },
      { title: "Hum Aapke Hain Koun", year: 1994, genre: "Romance" },
    ],
  },
  {
    actor: "Hrithik Roshan",
    films: [
      { title: "Koi... Mil Gaya", year: 2003, genre: "Sci-Fi Drama" },
      { title: "Jodhaa Akbar", year: 2008, genre: "Historical Romance" },
      { title: "Zindagi Na Milegi Dobara", year: 2011, genre: "Adventure" },
    ],
  },
];

async function seed() {
  console.log("Creating tables...");

  await sql`
    CREATE TABLE IF NOT EXISTS actors (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS films (
      id SERIAL PRIMARY KEY,
      actor_id INTEGER REFERENCES actors(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      year INTEGER,
      genre TEXT,
      rank INTEGER
    )
  `;

  console.log("Seeding data...");

  for (const { actor, films } of data) {
    const [row] = await sql`
      INSERT INTO actors (name) VALUES (${actor})
      ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `;
    for (let i = 0; i < films.length; i++) {
      const { title, year, genre } = films[i];
      await sql`
        INSERT INTO films (actor_id, title, year, genre, rank)
        VALUES (${row.id}, ${title}, ${year}, ${genre}, ${i + 1})
        ON CONFLICT DO NOTHING
      `;
    }
    console.log(`  Seeded: ${actor}`);
  }

  console.log("Done!");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
