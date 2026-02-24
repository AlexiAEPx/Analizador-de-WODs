"use client";

import { WodComparison as WodComparisonType, COLOR_MAP } from "@/lib/types";

interface WodComparisonProps {
  comparison: WodComparisonType;
  ayerWodText: string;
  ayerUbicacion: string;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-[0.72em] font-semibold tracking-[3px] uppercase mb-5"
      style={{ color: "rgba(255,255,255,0.3)" }}
    >
      {children}
    </h2>
  );
}

const SOBRECARGA_CONFIG = {
  baja: { color: "#5cd85c", emoji: "✅", label: "Baja", bg: "rgba(92,216,92,0.08)", border: "rgba(92,216,92,0.2)" },
  moderada: { color: "#feca57", emoji: "⚡", label: "Moderada", bg: "rgba(254,202,87,0.08)", border: "rgba(254,202,87,0.2)" },
  alta: { color: "#ff9f43", emoji: "⚠️", label: "Alta", bg: "rgba(255,159,67,0.08)", border: "rgba(255,159,67,0.2)" },
  critica: { color: "#ff5c5c", emoji: "🚨", label: "Crítica", bg: "rgba(255,92,92,0.08)", border: "rgba(255,92,92,0.2)" },
};

export default function WodComparison({ comparison, ayerWodText, ayerUbicacion }: WodComparisonProps) {
  const cfg = SOBRECARGA_CONFIG[comparison.nivel_sobrecarga];

  return (
    <div className="space-y-5">
      {/* Header sobrecarga */}
      <div className="glass text-center !py-9 animate-in">
        <div
          className="text-[0.72em] font-semibold tracking-[3px] uppercase mb-3"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          🔄 Comparación con ayer
        </div>
        <div
          className="text-[0.82em] mb-5"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          {ayerUbicacion}
        </div>

        {/* Intensidad doble */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="text-center">
            <div className="text-[0.65em] font-medium tracking-[2px] uppercase mb-1" style={{ color: "rgba(255,255,255,0.25)" }}>
              Ayer
            </div>
            <div className="text-[1.8em] font-bold leading-none text-[rgba(255,255,255,0.5)]">
              {comparison.intensidad_ayer}
              <span className="text-[0.45em] text-[rgba(255,255,255,0.2)]">/10</span>
            </div>
          </div>
          <div className="text-[1.2em] text-[rgba(255,255,255,0.15)]">+</div>
          <div className="text-center">
            <div className="text-[0.65em] font-medium tracking-[2px] uppercase mb-1" style={{ color: "rgba(255,255,255,0.25)" }}>
              Hoy
            </div>
            <div className="text-[1.8em] font-bold leading-none text-sem-rojo">
              {comparison.intensidad_hoy}
              <span className="text-[0.45em] text-[rgba(255,255,255,0.2)]">/10</span>
            </div>
          </div>
          <div className="text-[1.2em] text-[rgba(255,255,255,0.15)]">=</div>
          <div className="text-center">
            <div className="text-[0.65em] font-medium tracking-[2px] uppercase mb-1" style={{ color: "rgba(255,255,255,0.25)" }}>
              Acumulada
            </div>
            <div className="text-[1.8em] font-bold leading-none" style={{ color: cfg.color }}>
              {comparison.intensidad_acumulada}
              <span className="text-[0.45em] text-[rgba(255,255,255,0.2)]">/20</span>
            </div>
          </div>
        </div>

        {/* Badge sobrecarga */}
        <div
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full"
          style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
        >
          <span className="text-[1.1em]">{cfg.emoji}</span>
          <span className="text-[0.78em] font-semibold tracking-[2px] uppercase" style={{ color: cfg.color }}>
            Sobrecarga {cfg.label}
          </span>
        </div>
      </div>

      {/* WOD de ayer (resumen) */}
      <div className="glass animate-in animate-in-delay-1">
        <SectionTitle>📋 WOD de ayer</SectionTitle>
        <div className="bg-[rgba(255,255,255,0.03)] p-4 rounded-xl font-mono text-[0.82em] leading-[1.7] whitespace-pre-line text-[rgba(255,255,255,0.5)] max-h-[150px] overflow-y-auto">
          {ayerWodText}
        </div>
      </div>

      {/* Músculos sobrecargados */}
      {comparison.musculos_sobrecargados.length > 0 && (
        <div className="glass animate-in animate-in-delay-2">
          <SectionTitle>🔥 Músculos sobrecargados</SectionTitle>
          <p className="text-[0.78em] mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>
            Músculos trabajados intensamente ambos días
          </p>
          {comparison.musculos_sobrecargados.map((m, i) => {
            const cAyer = COLOR_MAP[m.color_ayer] || COLOR_MAP.verde;
            const cHoy = COLOR_MAP[m.color_hoy] || COLOR_MAP.verde;
            return (
              <div key={i} className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[0.84em] font-medium" style={{ color: "#ff5c5c" }}>
                    {m.nombre}
                    {m.sobrecarga && <span className="ml-2 text-[0.8em]">⚠️</span>}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[0.68em] min-w-[38px]" style={{ color: "rgba(255,255,255,0.3)" }}>Ayer</span>
                  <div className="flex-1 h-[6px] rounded-full overflow-hidden bg-[rgba(255,255,255,0.05)]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${m.ayer}%`, background: cAyer.fill, opacity: 0.6 }}
                    />
                  </div>
                  <span className="text-[0.7em] min-w-[28px] text-right" style={{ color: cAyer.text, opacity: 0.7 }}>{m.ayer}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[0.68em] min-w-[38px]" style={{ color: "rgba(255,255,255,0.3)" }}>Hoy</span>
                  <div className="flex-1 h-[6px] rounded-full overflow-hidden bg-[rgba(255,255,255,0.05)]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${m.hoy}%`, background: cHoy.fill, opacity: 0.85 }}
                    />
                  </div>
                  <span className="text-[0.7em] min-w-[28px] text-right" style={{ color: cHoy.text }}>{m.hoy}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Patrones repetidos */}
      {comparison.patrones_repetidos.length > 0 && (
        <div className="glass animate-in animate-in-delay-3">
          <SectionTitle>🎯 Patrones repetidos</SectionTitle>
          <p className="text-[0.78em] mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>
            Patrones de movimiento presentes ambos días
          </p>
          {comparison.patrones_repetidos.map((p, i) => {
            const cAyer = COLOR_MAP[p.color_ayer] || COLOR_MAP.verde;
            const cHoy = COLOR_MAP[p.color_hoy] || COLOR_MAP.verde;
            return (
              <div key={i} className="mb-3">
                <div className="text-[0.84em] font-medium mb-1" style={{ color: "rgba(255,255,255,0.7)" }}>
                  {p.nombre}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[0.68em] min-w-[38px]" style={{ color: "rgba(255,255,255,0.3)" }}>Ayer</span>
                  <div className="flex-1 h-[6px] rounded-full overflow-hidden bg-[rgba(255,255,255,0.05)]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(p.ayer * 2.5, 100)}%`, background: cAyer.fill, opacity: 0.6 }}
                    />
                  </div>
                  <span className="text-[0.7em] min-w-[35px] text-right" style={{ color: cAyer.text, opacity: 0.7 }}>~{p.ayer}%</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[0.68em] min-w-[38px]" style={{ color: "rgba(255,255,255,0.3)" }}>Hoy</span>
                  <div className="flex-1 h-[6px] rounded-full overflow-hidden bg-[rgba(255,255,255,0.05)]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(p.hoy * 2.5, 100)}%`, background: cHoy.fill, opacity: 0.85 }}
                    />
                  </div>
                  <span className="text-[0.7em] min-w-[35px] text-right" style={{ color: cHoy.text }}>~{p.hoy}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Veredicto */}
      <div className="glass animate-in animate-in-delay-4">
        <SectionTitle>🩺 Veredicto</SectionTitle>
        <div
          className="analisis-text text-[0.9em] leading-[1.85] text-[rgba(255,255,255,0.7)]"
          dangerouslySetInnerHTML={{
            __html:
              comparison.veredicto
                ?.replace(/\n\n/g, "</p><p>")
                ?.replace(/^/, "<p>")
                ?.replace(/$/, "</p>") || "",
          }}
        />
      </div>

      {/* Recomendación */}
      <div className="glass animate-in animate-in-delay-5">
        <SectionTitle>💡 Recomendación</SectionTitle>
        <div
          className="border-l-2 py-3.5 px-4 rounded-r-xl text-[0.88em] leading-relaxed text-[rgba(255,255,255,0.7)]"
          style={{
            background: cfg.bg,
            borderColor: cfg.border,
          }}
          dangerouslySetInnerHTML={{
            __html:
              comparison.recomendacion
                ?.replace(/\n\n/g, "</p><p>")
                ?.replace(/^/, "<p>")
                ?.replace(/$/, "</p>") || "",
          }}
        />
      </div>
    </div>
  );
}
