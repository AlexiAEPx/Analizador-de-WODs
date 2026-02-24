"use client";

import { WodAnalisis } from "@/lib/types";
import BarRow from "./BarRow";

interface WodResultProps {
  result: WodAnalisis;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-[0.72em] font-semibold tracking-[3px] uppercase mb-5"
      style={{ color: "rgba(var(--base-rgb), 0.3)" }}
    >
      {children}
    </h2>
  );
}

function GroupLabel({
  children,
  first,
}: {
  children: React.ReactNode;
  first?: boolean;
}) {
  return (
    <div
      className={`text-[0.7em] font-medium tracking-[2px] uppercase mb-2 pb-1.5 ${first ? "mt-1" : "mt-5"}`}
      style={{
        color: "rgba(var(--base-rgb), 0.2)",
        borderBottom: "1px solid rgba(var(--base-rgb), 0.04)",
      }}
    >
      {children}
    </div>
  );
}

export default function WodResult({ result }: WodResultProps) {
  return (
    <div className="space-y-5">
      {/* Header con intensidad */}
      <div className="glass text-center !py-9 animate-in">
        <div
          className="text-[0.72em] font-semibold tracking-[3px] uppercase mb-3"
          style={{ color: "rgba(var(--base-rgb), 0.3)" }}
        >
          Resultado del análisis
        </div>
        <div
          className="text-[0.85em] mb-4"
          style={{ color: "rgba(var(--base-rgb), 0.5)" }}
        >
          {result.tipo_wod} ·{" "}
          {result.enfoque === "retrospectivo"
            ? "Retrospectivo"
            : "Prospectivo"}
        </div>
        <div
          className="inline-flex flex-col items-center px-9 py-4 rounded-full"
          style={{
            background: "rgba(255,92,92,0.08)",
            border: "1px solid rgba(255,92,92,0.15)",
          }}
        >
          <span className="text-[2.2em] font-bold leading-none text-sem-rojo">
            {result.intensidad}
            <span
              className="text-[0.5em]"
              style={{ color: "rgba(var(--base-rgb), 0.25)" }}
            >
              /10
            </span>
          </span>
          <span
            className="text-[0.6em] font-medium tracking-[3px] uppercase mt-1"
            style={{ color: "rgba(var(--base-rgb), 0.3)" }}
          >
            Intensidad
          </span>
        </div>
      </div>

      {/* WOD Transcrito */}
      <div className="glass animate-in animate-in-delay-1">
        <SectionTitle>📋 WOD transcrito</SectionTitle>
        <div
          className="p-5 rounded-xl font-mono text-[0.84em] leading-[1.8] whitespace-pre-line"
          style={{
            background: "rgba(var(--base-rgb), 0.03)",
            color: "rgba(var(--base-rgb), 0.7)",
          }}
        >
          {result.wod_transcrito}
        </div>
      </div>

      {/* Leyenda */}
      <div className="glass-sm animate-in animate-in-delay-2">
        <div className="flex gap-5 flex-wrap">
          {[
            ["#ff5c5c", "Muy machacado"],
            ["#ff9f43", "Bastante trabajado"],
            ["#feca57", "Tocado ligeramente"],
            ["#5cd85c", "Descansado"],
          ].map(([c, l]) => (
            <div
              key={l}
              className="flex items-center gap-2 text-[0.78em]"
              style={{ color: "rgba(var(--base-rgb), 0.45)" }}
            >
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ background: c }}
              />
              {l}
            </div>
          ))}
        </div>
      </div>

      {/* Patrones */}
      <div className="glass animate-in animate-in-delay-3">
        <SectionTitle>🎯 Patrones de movimiento</SectionTitle>
        {result.patrones
          ?.sort((a, b) => b.pct - a.pct)
          .map((p, i) => (
            <BarRow
              key={i}
              nombre={p.nombre}
              color={p.color}
              nivel={p.pct * 2.5}
              suffix={`~${p.pct}%`}
            />
          ))}
      </div>

      {/* Músculos */}
      <div className="glass animate-in animate-in-delay-4">
        <SectionTitle>💪 Músculos trabajados</SectionTitle>
        <GroupLabel first>Tren inferior</GroupLabel>
        {result.musculos?.tren_inferior
          ?.sort((a, b) => b.nivel - a.nivel)
          .map((m, i) => (
            <BarRow key={i} nombre={m.nombre} color={m.color} nivel={m.nivel} />
          ))}
        <GroupLabel>Core</GroupLabel>
        {result.musculos?.core
          ?.sort((a, b) => b.nivel - a.nivel)
          .map((m, i) => (
            <BarRow key={i} nombre={m.nombre} color={m.color} nivel={m.nivel} />
          ))}
        <GroupLabel>Tren superior</GroupLabel>
        {result.musculos?.tren_superior
          ?.sort((a, b) => b.nivel - a.nivel)
          .map((m, i) => (
            <BarRow key={i} nombre={m.nombre} color={m.color} nivel={m.nivel} />
          ))}
      </div>

      {/* Habilidades */}
      <div className="glass animate-in animate-in-delay-5">
        <SectionTitle>⚡ Habilidades físicas — Las 10 del CrossFit</SectionTitle>
        {result.habilidades
          ?.sort((a, b) => b.nivel - a.nivel)
          .map((h, i) => (
            <BarRow key={i} nombre={h.nombre} color={h.color} nivel={h.nivel} />
          ))}
      </div>

      {/* Gaps */}
      <div className="glass animate-in animate-in-delay-6">
        <SectionTitle>⚠️ Gaps y debilidades</SectionTitle>
        {result.gaps?.map((g, i) => (
          <div
            key={i}
            className="py-3.5 px-4 my-2.5 rounded-r-xl text-[0.88em] leading-relaxed border-l-2"
            style={{
              background: "rgba(255,92,92,0.04)",
              borderColor: "rgba(255,92,92,0.3)",
              color: "rgba(var(--base-rgb), 0.7)",
            }}
          >
            <strong className="text-sem-rojo font-medium">{g.titulo}</strong> —{" "}
            {g.descripcion}
          </div>
        ))}
        {result.tip && (
          <>
            <div
              className="my-4"
              style={{ borderTop: "1px solid rgba(var(--base-rgb), 0.04)" }}
            />
            <div
              className="py-3.5 px-4 rounded-r-xl text-[0.88em] leading-relaxed border-l-2"
              style={{
                background: "rgba(92,216,92,0.04)",
                borderColor: "rgba(92,216,92,0.3)",
                color: "rgba(var(--base-rgb), 0.7)",
              }}
            >
              <strong className="text-sem-verde font-medium">
                💡 Para complementar:
              </strong>{" "}
              {result.tip}
            </div>
          </>
        )}
      </div>

      {/* Análisis detallado */}
      <div className="glass animate-in animate-in-delay-7">
        <SectionTitle>📝 Análisis detallado</SectionTitle>
        <div
          className="analisis-text text-[0.9em] leading-[1.85]"
          style={{ color: "rgba(var(--base-rgb), 0.7)" }}
          dangerouslySetInnerHTML={{
            __html:
              result.analisis
                ?.replace(/\n\n/g, "</p><p>")
                ?.replace(/^/, "<p>")
                ?.replace(/$/, "</p>") || "",
          }}
        />
      </div>
    </div>
  );
}
