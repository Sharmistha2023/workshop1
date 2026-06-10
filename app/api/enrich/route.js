import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { searchActor, searchMovie, imageUrl } from "@/lib/tmdb";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST() {
  if (!process.env.TMDB_API_KEY) {
    return NextResponse.json({ error: "TMDB_API_KEY not configured" }, { status: 503 });
  }

  const actors = await sql`SELECT id, name FROM actors WHERE tmdb_id IS NULL`;
  const results = [];

  for (const actor of actors) {
    try {
      const tmdbActor = await searchActor(actor.name);
      if (!tmdbActor) { results.push({ actor: actor.name, status: "not found" }); continue; }

      const photo = imageUrl(tmdbActor.profile_path);
      await sql`
        UPDATE actors SET tmdb_id = ${tmdbActor.id}, photo_url = ${photo}, bio = ${tmdbActor.biography || null}
        WHERE id = ${actor.id}
      `;

      // Enrich films for this actor
      const films = await sql`SELECT id, title, year FROM films WHERE actor_id = ${actor.id} AND tmdb_id IS NULL`;
      for (const film of films) {
        try {
          const tmdbFilm = await searchMovie(film.title, film.year);
          if (!tmdbFilm) continue;
          await sql`
            UPDATE films
            SET tmdb_id = ${tmdbFilm.id},
                poster_url = ${imageUrl(tmdbFilm.poster_path)},
                rating = ${tmdbFilm.vote_average || null},
                overview = ${tmdbFilm.overview || null}
            WHERE id = ${film.id}
          `;
        } catch {}
      }

      results.push({ actor: actor.name, status: "enriched", tmdb_id: tmdbActor.id });
    } catch (err) {
      results.push({ actor: actor.name, status: "error", error: err.message });
    }
  }

  return NextResponse.json({ enriched: results.length, results });
}
