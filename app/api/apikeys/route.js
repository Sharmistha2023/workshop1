import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";
import { createHash, randomBytes } from "crypto";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [user] = await sql`SELECT id FROM users WHERE email = ${session.user.email}`;
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const keys = await sql`
    SELECT id, key_prefix, label, last_used_at, created_at
    FROM api_keys WHERE user_id = ${user.id}
    ORDER BY created_at DESC
  `;
  return NextResponse.json(keys);
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [user] = await sql`SELECT id FROM users WHERE email = ${session.user.email}`;
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { label } = await request.json().catch(() => ({}));

  // Check limit
  const [cnt] = await sql`SELECT COUNT(*) AS c FROM api_keys WHERE user_id = ${user.id}`;
  if (Number(cnt.c) >= 5) {
    return NextResponse.json({ error: "Max 5 API keys per account." }, { status: 400 });
  }

  const rawKey = "ff_" + randomBytes(24).toString("hex");
  const prefix = rawKey.substring(0, 8);
  const hash   = createHash("sha256").update(rawKey).digest("hex");

  await sql`
    INSERT INTO api_keys (user_id, key_hash, key_prefix, label)
    VALUES (${user.id}, ${hash}, ${prefix}, ${label || "My API Key"})
  `;

  return NextResponse.json({ key: rawKey, prefix, label: label || "My API Key",
    message: "Store this key — it won't be shown again." });
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [user] = await sql`SELECT id FROM users WHERE email = ${session.user.email}`;
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { id } = await request.json();
  await sql`DELETE FROM api_keys WHERE id = ${id} AND user_id = ${user.id}`;
  return NextResponse.json({ ok: true });
}
