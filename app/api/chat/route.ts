import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const CHAT_SYSTEM_PROMPT = `Eres un coach experto de CrossFit y analista de WODs. El usuario ya ha recibido un análisis detallado de su WOD y ahora quiere seguir charlando contigo para profundizar, hacer preguntas, o pedir consejos adicionales.

Contexto del usuario: peso corporal ~64 kg, altura 168 cm, nivel intermedio-avanzado.

Reglas:
- Responde en español siempre.
- Sé técnico, didáctico y directo. Un toque de humor sarcástico puntual está bien.
- Puedes usar HTML básico para formatear: <strong> para negritas y <span class='hl'> para destacar datos importantes.
- No repitas el análisis completo — el usuario ya lo tiene. Ve al grano con lo que pregunte.
- Si el usuario pide que modifiques escalas, pesos, o el WOD, dale sugerencias concretas.
- Si preguntan sobre lesiones o dolor, recomienda siempre consultar a un profesional médico, pero da contexto técnico.
- Respuestas concisas pero completas. No escribas párrafos interminables.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, wodAnalisis } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided" },
        { status: 400 }
      );
    }

    const contextMessage = wodAnalisis
      ? `Contexto del WOD analizado:\n- Tipo: ${wodAnalisis.tipo_wod}\n- Intensidad: ${wodAnalisis.intensidad}/10\n- Enfoque: ${wodAnalisis.enfoque}\n- WOD: ${wodAnalisis.wod_transcrito}\n- Análisis: ${wodAnalisis.analisis}\n- Tip: ${wodAnalisis.tip}`
      : "";

    const systemPrompt = contextMessage
      ? `${CHAT_SYSTEM_PROMPT}\n\n${contextMessage}`
      : CHAT_SYSTEM_PROMPT;

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
