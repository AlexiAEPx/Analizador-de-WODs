"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { marked } from "marked";
import { WodAnalisis } from "@/lib/types";

marked.setOptions({
  breaks: true,
  gfm: true,
});

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface WodChatProps {
  wodAnalisis: WodAnalisis;
}

export default function WodChat({ wodAnalisis }: WodChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = { role: "user", content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          wodAnalisis,
        }),
      });

      if (!resp.ok) throw new Error("Error en el chat");

      const data = await resp.json();
      setMessages([
        ...newMessages,
        { role: "assistant", content: data.response },
      ]);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "Ha ocurrido un error. Intenta de nuevo.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="animate-in animate-in-delay-8">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full py-4 rounded-2xl font-medium text-[0.88em] tracking-[1px] transition-all chat-open-btn"
        >
          <span className="flex items-center justify-center gap-3">
            <span className="text-lg">💬</span>
            <span>Seguir charlando sobre este WOD</span>
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="glass animate-in animate-in-delay-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-[0.72em] font-semibold tracking-[3px] uppercase"
          style={{ color: "rgba(var(--base-rgb), 0.3)" }}
        >
          💬 Chat sobre tu WOD
        </h2>
        <button
          onClick={() => setIsOpen(false)}
          className="text-[0.75em] px-3 py-1 rounded-lg transition-colors"
          style={{
            color: "rgba(var(--base-rgb), 0.3)",
            background: "rgba(var(--base-rgb), 0.04)",
          }}
        >
          Minimizar
        </button>
      </div>

      {/* Messages */}
      <div className="chat-messages-container space-y-3 mb-4 max-h-[400px] overflow-y-auto pr-1">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p
              className="text-[0.85em] mb-3"
              style={{ color: "rgba(var(--base-rgb), 0.25)" }}
            >
              Pregunta lo que quieras sobre el WOD
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                "¿Cómo puedo escalar este WOD?",
                "¿Qué movilidad necesito?",
                "¿Cómo distribuyo el ritmo?",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                    inputRef.current?.focus();
                  }}
                  className="chat-suggestion"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-bubble ${msg.role === "user" ? "chat-bubble-user" : "chat-bubble-assistant"}`}
          >
            {msg.role === "assistant" ? (
              <div
                className="chat-markdown"
                dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) as string }}
              />
            ) : (
              <span>{msg.content}</span>
            )}
          </div>
        ))}

        {loading && (
          <div className="chat-bubble chat-bubble-assistant">
            <span className="flex items-center gap-2">
              <span className="loader-dot inline-block w-1.5 h-1.5 rounded-full bg-sem-rojo" />
              <span className="loader-dot inline-block w-1.5 h-1.5 rounded-full bg-sem-rojo" />
              <span className="loader-dot inline-block w-1.5 h-1.5 rounded-full bg-sem-rojo" />
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 items-end">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu pregunta..."
          rows={1}
          className="chat-input flex-1"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          className="chat-send-btn"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
