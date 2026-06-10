import { NextResponse } from "next/server";
import sql from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang") || "All";

  const films = lang === "All"
    ? await sql`
        SELECT f.*, a.name AS actor_name
        FROM films f JOIN actors a ON a.id = f.actor_id
        ORDER BY f.language, f.rank ASC
        LIMIT 60
      `
    : await sql`
        SELECT f.*, a.name AS actor_name
        FROM films f JOIN actors a ON a.id = f.actor_id
        WHERE f.language = ${lang}
        ORDER BY f.rank ASC
      `;

  return NextResponse.json(films);
}
