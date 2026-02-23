"use client";

import { SemaforoColor, COLOR_MAP } from "@/lib/types";

interface BarRowProps {
  nombre: string;
  color: SemaforoColor;
  nivel: number;
  suffix?: string;
}

const emojiMap: Record<SemaforoColor, string> = {
  rojo: "🔴",
  naranja: "🟠",
  amarillo: "🟡",
  verde: "🟢",
};

export default function BarRow({ nombre, color, nivel, suffix }: BarRowProps) {
  const c = COLOR_MAP[color] || COLOR_MAP.verde;
  return (
    <div className="flex items-center gap-3 my-[6px]">
      <span
        className="min-w-[180px] text-[0.84em] font-normal"
        style={{ color: c.text }}
      >
        {nombre}
      </span>
      <div className="flex-1 h-2 rounded-full overflow-hidden bg-[rgba(255,255,255,0.05)]">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${Math.max(nivel, 2)}%`,
            opacity: 0.85,
            background: c.fill,
          }}
        />
      </div>
      <span
        className="min-w-[40px] text-right text-[0.76em] font-medium"
        style={{ color: c.text }}
      >
        {suffix || emojiMap[color]}
      </span>
    </div>
  );
}
