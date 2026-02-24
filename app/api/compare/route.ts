import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { WOD_COMPARE_PROMPT } from "@/lib/prompt";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { analisisHoy, analisisAyer } = await req.json();

    if (!analisisHoy || !analisisAyer) {
      return NextResponse.json(
        { error: "Se necesitan ambos análisis" },
        { status: 400 }
      );
    }

    const userText = `WOD DE AYER:
${JSON.stringify(analisisAyer, null, 2)}

WOD DE HOY:
${JSON.stringify(analisisHoy, null, 2)}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      system: WOD_COMPARE_PROMPT,
      messages: [{ role: "user", content: userText }],
    });

    const text = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b as any).text)
      .join("");

    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("Compare error:", err);
    return NextResponse.json(
      { error: err.message || "Error comparing WODs" },
      { status: 500 }
    );
  }
}
