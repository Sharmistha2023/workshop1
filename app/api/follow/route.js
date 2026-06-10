import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { user_id } = await request.json();
  if (Number(user_id) === session.user.id) return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });

  await sql`
    INSERT INTO user_follows (follower_id, following_id)
    VALUES (${session.user.id}, ${user_id})
    ON CONFLICT DO NOTHING
  `;
  return NextResponse.json({ ok: true });
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { user_id } = await request.json();
  await sql`
    DELETE FROM user_follows WHERE follower_id = ${session.user.id} AND following_id = ${user_id}
  `;
  return NextResponse.json({ ok: true });
}
