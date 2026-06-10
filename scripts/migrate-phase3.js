const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  // Add language to films
  await sql`ALTER TABLE films ADD COLUMN IF NOT EXISTS language text DEFAULT 'Hindi'`;

  // Add is_premium to users
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false`;

  // Suggestions table (Task 20)
  await sql`
    CREATE TABLE IF NOT EXISTS suggestions (
      id SERIAL PRIMARY KEY,
      user_id integer REFERENCES users(id) ON DELETE SET NULL,
      entity_type text NOT NULL,
      entity_id integer,
      field_name text NOT NULL,
      suggested_value text NOT NULL,
      reason text,
      status text DEFAULT 'pending',
      created_at timestamptz DEFAULT now()
    )
  `;

  // API keys table (Task 23)
  await sql`
    CREATE TABLE IF NOT EXISTS api_keys (
      id SERIAL PRIMARY KEY,
      user_id integer REFERENCES users(id) ON DELETE CASCADE,
      key_hash text UNIQUE NOT NULL,
      key_prefix text NOT NULL,
      label text,
      last_used_at timestamptz,
      created_at timestamptz DEFAULT now()
    )
  `;

  // Seed regional films (Task 19)
  await sql`
    INSERT INTO actors (name, bio) VALUES
      ('Rajinikanth',  'Legendary Tamil actor known for Enthiran, Kabali, and many iconic action films.'),
      ('Kamal Haasan', 'Versatile Tamil actor and filmmaker known for Nayagan, Anbe Sivam, and Dasavathaaram.'),
      ('Mohanlal',     'Acclaimed Malayalam actor known for Drishyam, Kireedam, and Vandanam.'),
      ('Mammootty',    'Versatile Malayalam actor known for Oru CBI Diary Kurippu and Vidheyan.'),
      ('Prabhas',      'Telugu superstar known for Baahubali and Mirchi.'),
      ('Mahesh Babu',  'Telugu star known for Pokiri, Srimanthudu, and Maharshi.')
    ON CONFLICT DO NOTHING
  `;

  const actorRows = await sql`SELECT id, name FROM actors WHERE name IN ('Rajinikanth','Kamal Haasan','Mohanlal','Mammootty','Prabhas','Mahesh Babu')`;
  const byName = {};
  actorRows.forEach(a => byName[a.name] = a.id);

  const regionalFilms = [
    { actor: 'Rajinikanth',  title: 'Enthiran',    year: 2010, genre: 'Science Fiction/Action', rank: 1, language: 'Tamil' },
    { actor: 'Rajinikanth',  title: 'Kabali',       year: 2016, genre: 'Action Drama',           rank: 2, language: 'Tamil' },
    { actor: 'Rajinikanth',  title: 'Muthu',        year: 1995, genre: 'Drama',                  rank: 3, language: 'Tamil' },
    { actor: 'Kamal Haasan', title: 'Nayagan',      year: 1987, genre: 'Crime Drama',             rank: 1, language: 'Tamil' },
    { actor: 'Kamal Haasan', title: 'Anbe Sivam',   year: 2003, genre: 'Drama/Comedy',           rank: 2, language: 'Tamil' },
    { actor: 'Kamal Haasan', title: 'Dasavathaaram',year: 2008, genre: 'Action/Thriller',        rank: 3, language: 'Tamil' },
    { actor: 'Mohanlal',     title: 'Drishyam',     year: 2013, genre: 'Thriller Drama',         rank: 1, language: 'Malayalam' },
    { actor: 'Mohanlal',     title: 'Kireedam',     year: 1989, genre: 'Drama',                  rank: 2, language: 'Malayalam' },
    { actor: 'Mohanlal',     title: 'Vandanam',     year: 1989, genre: 'Action',                 rank: 3, language: 'Malayalam' },
    { actor: 'Mammootty',    title: 'Oru CBI Diary Kurippu', year: 1988, genre: 'Crime Drama', rank: 1, language: 'Malayalam' },
    { actor: 'Mammootty',    title: 'Vidheyan',     year: 1993, genre: 'Drama',                  rank: 2, language: 'Malayalam' },
    { actor: 'Mammootty',    title: 'Mathilukal',   year: 1990, genre: 'Drama/Romance',          rank: 3, language: 'Malayalam' },
    { actor: 'Prabhas',      title: 'Baahubali: The Beginning', year: 2015, genre: 'Historical Action', rank: 1, language: 'Telugu' },
    { actor: 'Prabhas',      title: 'Baahubali 2: The Conclusion', year: 2017, genre: 'Historical Action', rank: 2, language: 'Telugu' },
    { actor: 'Prabhas',      title: 'Mirchi',       year: 2013, genre: 'Action/Romance',         rank: 3, language: 'Telugu' },
    { actor: 'Mahesh Babu',  title: 'Pokiri',       year: 2006, genre: 'Action/Thriller',        rank: 1, language: 'Telugu' },
    { actor: 'Mahesh Babu',  title: 'Srimanthudu',  year: 2015, genre: 'Drama/Action',           rank: 2, language: 'Telugu' },
    { actor: 'Mahesh Babu',  title: 'Maharshi',     year: 2019, genre: 'Drama',                  rank: 3, language: 'Telugu' },
  ];

  for (const f of regionalFilms) {
    const actorId = byName[f.actor];
    if (!actorId) continue;
    await sql`
      INSERT INTO films (actor_id, title, year, genre, rank, language)
      VALUES (${actorId}, ${f.title}, ${f.year}, ${f.genre}, ${f.rank}, ${f.language})
      ON CONFLICT DO NOTHING
    `;
  }

  // Update Hindi for existing films
  await sql`UPDATE films SET language = 'Hindi' WHERE language IS NULL`;

  console.log('Migration done.');
}

migrate().catch(console.error);
