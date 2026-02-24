import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildChatSystemPrompt } from "@/lib/prompt";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { messages, wodAnalisis, userProfile } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided" },
        { status: 400 }
      );
    }

    const baseChatPrompt = buildChatSystemPrompt(userProfile || null);

    const contextMessage = wodAnalisis
      ? `Contexto del WOD analizado:\n- Tipo: ${wodAnalisis.tipo_wod}\n- Intensidad: ${wodAnalisis.intensidad}/10\n- Enfoque: ${wodAnalisis.enfoque}\n- WOD: ${wodAnalisis.wod_transcrito}\n- Análisis: ${wodAnalisis.analisis}\n- Tip: ${wodAnalisis.tip}`
      : "";

    const systemPrompt = contextMessage
      ? `${baseChatPrompt}\n\n${contextMessage}`
      : baseChatPrompt;

    const apiMessages = messages.map(
      (m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })
    );

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: systemPrompt,
      messages: apiMessages,
    });

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as any).text)
      .join("");

    return NextResponse.json({ response: text });
  } catch (err: any) {
    console.error("Chat error:", err);
    return NextResponse.json(
      { error: err.message || "Error in chat" },
      { status: 500 }
    );
  }
}
