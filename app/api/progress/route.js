import { NextResponse } from "next/server";
import sql from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await sql`
    SELECT id, phase_number, task_name, task_progress, dependency, logs, error_log
    FROM development_process
    ORDER BY phase_number, id
  `;
  return NextResponse.json(rows);
}
