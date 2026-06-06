"use client";

import { useState } from "react";

const movies = {
  "aamir khan": ["3 Idiots", "Lagaan", "Taare Zameen Par"],
  "shah rukh khan": ["Swades", "Chak De! India", "Dilwale Dulhania Le Jayenge"],
  "amitabh bachchan": ["Deewaar", "Sholay", "Paa"],
  "salman khan": ["Bajrangi Bhaijaan", "Sultan", "Hum Aapke Hain Koun"],
  "hrithik roshan": ["Koi... Mil Gaya", "Jodhaa Akbar", "Zindagi Na Milegi Dobara"],
};

function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

export default function Home() {
  const [actor, setActor] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  function getMovies() {
    const key = actor.trim().toLowerCase();

    if (!key) {
      setError("Please enter an actor name.");
      setResult(null);
      return;
    }

    if (movies[key]) {
      setResult({ name: toTitleCase(key), films: movies[key] });
      setError("");
    } else {
      setError(`Actor not found. Add "${toTitleCase(key)}" to the movie database.`);
      setResult(null);
    }
  }

  return (
    <div className="container">
      <h1>Top 3 Films Finder</h1>

      <input
        type="text"
        placeholder="Enter actor name (e.g. Aamir Khan)"
        value={actor}
        onChange={(e) => setActor(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && getMovies()}
      />

      <button onClick={getMovies}>Show Top 3 Films</button>

      <div className="result">
        {error && <div className="error">{error}</div>}

        {result && (
          <>
            <h3>Top 3 Films of {result.name}</h3>
            {result.films.map((film, i) => (
              <div className="movie" key={i}>
                <strong>{i + 1}.</strong> {film}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
