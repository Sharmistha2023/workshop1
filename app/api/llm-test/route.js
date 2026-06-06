import { NextResponse } from "next/server";
import { chat, DEFAULT_MODEL } from "@/lib/llm";

export const dynamic = "force-dynamic";

export async function GET() {
  const reply = await chat(
    "In one sentence, recommend a Bollywood film and why someone should watch it.",
    { temperature: 0.8 }
  );

  return NextResponse.json({ model: DEFAULT_MODEL, reply });
}
