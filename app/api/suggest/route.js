import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { entityType, entityId, fieldName, suggestedValue, reason } = await request.json();
  if (!entityType || !fieldName || !suggestedValue) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const [user] = await sql`SELECT id FROM users WHERE email = ${session.user.email}`;
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const [row] = await sql`
    INSERT INTO suggestions (user_id, entity_type, entity_id, field_name, suggested_value, reason)
    VALUES (${user.id}, ${entityType}, ${entityId || null}, ${fieldName}, ${suggestedValue}, ${reason || null})
    RETURNING id
  `;

  return NextResponse.json({ id: row.id, message: "Thank you! Your suggestion has been submitted." });
}

export async function GET() {
  const rows = await sql`
    SELECT s.*, u.name AS user_name
    FROM suggestions s
    LEFT JOIN users u ON u.id = s.user_id
    ORDER BY s.created_at DESC
    LIMIT 50
  `;
  return NextResponse.json(rows);
}
