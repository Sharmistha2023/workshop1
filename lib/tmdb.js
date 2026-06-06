const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE = "https://image.tmdb.org/t/p/w500";
const API_KEY = process.env.TMDB_API_KEY;

async function tmdbFetch(path, params = {}) {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("language", "en-US");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB ${res.status}: ${path}`);
  return res.json();
}

export async function searchActor(name) {
  const data = await tmdbFetch("/search/person", { query: name });
  return data.results?.[0] || null;
}

export async function getActorDetails(tmdbId) {
  return tmdbFetch(`/person/${tmdbId}`, { append_to_response: "images" });
}

export async function searchMovie(title, year) {
  const data = await tmdbFetch("/search/movie", { query: title, year });
  return data.results?.[0] || null;
}

export async function getMovieDetails(tmdbId) {
  return tmdbFetch(`/movie/${tmdbId}`, {
    append_to_response: "credits,videos,watch/providers",
  });
}

export async function getWatchProviders(tmdbId) {
  const data = await tmdbFetch(`/movie/${tmdbId}/watch/providers`);
  return data.results?.IN || data.results?.US || null;
}

export function imageUrl(path) {
  if (!path) return null;
  return `${TMDB_IMAGE}${path}`;
}
