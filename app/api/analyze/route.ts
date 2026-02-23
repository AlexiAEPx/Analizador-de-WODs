import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { WOD_SYSTEM_PROMPT } from "@/lib/prompt";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { wodText, modo, imageBase64, imageMediaType } = await req.json();

    if (!wodText?.trim() && !imageBase64) {
      return NextResponse.json({ error: "No WOD provided" }, { status: 400 });
    }

    const userContent: any[] = [];

    if (imageBase64) {
      userContent.push({
        type: "image",
        source: {
          type: "base64",
          media_type: imageMediaType || "image/jpeg",
          data: imageBase64,
        },
      });
    }

    const enfoque = modo === "prospectivo" ? "Voy a hacer" : "Ya he hecho";
    const textPart = wodText?.trim()
      ? `${enfoque} este WOD:\n\n${wodText.trim()}`
      : `${enfoque} este WOD (mira la imagen de la pizarra).`;

    userContent.push({ type: "text", text: textPart });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system: WOD_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    });

    const text = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b as any).text)
      .join("");

    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("Analyze error:", err);
    return NextResponse.json(
      { error: err.message || "Error analyzing WOD" },
      { status: 500 }
    );
  }
}
